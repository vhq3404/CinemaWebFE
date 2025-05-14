import React, { useState, useEffect, useRef } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import "./AddShowtimeComponent.css";

const AddShowtimeComponent = ({ onClose, onAddSuccess }) => {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [rawDate, setRawDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const hiddenDateRef = useRef();
  const [formData, setFormData] = useState({
    movieId: "",
    theaterId: "",
    roomId: "",
    date: "",
    startTime: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/movies");
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phim:", err);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/theaters");
        const data = await res.json();
        setTheaters(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách rạp:", err);
      }
    };
    fetchTheaters();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!formData.theaterId) return;
      try {
        const res = await fetch(
          `http://localhost:8080/api/rooms/theater/${formData.theaterId}`
        );
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phòng:", err);
      }
    };
    fetchRooms();
  }, [formData.theaterId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStartTime = (startTime) => {
    const [hour, minute] = startTime.split(":").map(Number);
    if (hour < 9 || hour > 23 || (hour === 23 && minute > 45)) {
      return false; // Thời gian không hợp lệ
    }
    return true; // Thời gian hợp lệ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateStartTime(formData.startTime)) {
      setMessage("Giờ bắt đầu phải từ 9:00 đến 23:45");
      return;
    }

    const payload = {
      ...formData,
      theaterId: parseInt(formData.theaterId, 10),
      roomId: parseInt(formData.roomId, 10),
    };

    try {
      const res = await fetch("http://localhost:8080/api/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("data", formData);
      const result = await res.json();

      if (res.ok) {
        setMessage("Tạo suất chiếu thành công!");
        setFormData({
          movieId: "",
          theaterId: "",
          roomId: "",
          date: "",
          startTime: "",
        });
        onAddSuccess?.();
        onClose();
      } else {
        setMessage(`Lỗi: ${result.error}`);
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu tạo suất chiếu:", err);
      setMessage(" Đã xảy ra lỗi không xác định.");
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setRawDate(date);
    const [year, month, day] = date.split("-");
    if (year && month && day) {
      setFormattedDate(`${day}/${month}/${year}`);
      setFormData((prev) => ({
        ...prev,
        date: date, // Cập nhật ngày vào formData
      }));
    }
  };

  const openDatePicker = () => {
    hiddenDateRef.current.showPicker?.();
  };

  // Điều kiện để hiển thị rạp và phòng chiếu chỉ khi ngày và giờ hợp lệ
  const canSelectTheaterAndRoom =
    formData.date && validateStartTime(formData.startTime);

  return (
    <div className="add-showtime-container">
      <span className="add-showtime-close-btn" onClick={onClose}>
        &times;
      </span>
      <h2>Tạo suất chiếu mới</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Phim:</label>
          <select
            name="movieId"
            value={formData.movieId}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((movie) => (
              <option key={movie._id} value={movie._id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày chiếu:</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={formattedDate}
                readOnly
                onClick={openDatePicker}
                style={{
                  fontSize: "16px",
                  fontFamily: "monospace",
                  padding: "10px 40px 10px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />

              <span
                onClick={openDatePicker}
                style={{
                  position: "absolute",
                  right: "24px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                <FaRegCalendarAlt />
              </span>
            </div>

            <input
              type="date"
              ref={hiddenDateRef}
              value={rawDate}
              onChange={handleDateChange}
              style={{
                opacity: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
            />
          </div>

          <div className="form-group">
            <label>Giờ bắt đầu:</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              step="900" // 15 phút
              min="09:00"
              max="23:45"
            />
          </div>
        </div>

        {canSelectTheaterAndRoom && (
          <>
            <div className="form-group">
              <label>Rạp:</label>
              <select
                name="theaterId"
                value={formData.theaterId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn rạp --</option>
                {theaters.map((theater) => (
                  <option key={theater.id} value={theater.id}>
                    {theater.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Phòng chiếu:</label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button type="submit">Tạo suất chiếu</button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default AddShowtimeComponent;
