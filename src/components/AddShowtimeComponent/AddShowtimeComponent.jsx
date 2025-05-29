import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import { FaRegCalendarAlt } from "react-icons/fa";
import ScheduleChart from "../ScheduleChart/ScheduleChart";
import "./AddShowtimeComponent.css";

const AddShowtimeComponent = ({ onClose, onAddSuccess, scheduleMovies }) => {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  //const [showtimes, setShowtimes] = useState([]);
  const [rawDate, setRawDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const hiddenDateRef = useRef();
  const [formData, setFormData] = useState({
    movieId: "",
    theaterId: "",
    roomId: "",
    date: "",
    startTime: "",
    priceRegular: "",
    priceVIP: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (scheduleMovies && Array.isArray(scheduleMovies)) {
      setFilteredMovies(scheduleMovies);
    }
  }, [scheduleMovies]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/movies`);
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
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/theaters`
        );
        const data = await res.json();
        setTheaters(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách rạp:", err);
      }
    };
    fetchTheaters();
  }, []);

  const fetchShowtimes = useCallback(async () => {
    if (!selectedTheater) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/showtimes?theaterId=${selectedTheater.id}`
      );
      const data = await response.json();

      if (!response.ok) {
        console.error("Không có suất chiếu:", data.error);
        setFilteredMovies([]);
        //setShowtimes([]);

        return;
      }

      const showtimes = data.showtimes;

      // Nhóm theo movie title
      const movieMap = {};
      for (const showtime of showtimes) {
        const title = showtime.movie.title;
        if (!movieMap[title]) {
          movieMap[title] = { title, showtimes: [] };
        }
        movieMap[title].showtimes.push({
          _id: showtime._id,
          date: showtime.date.slice(0, 10),
          start_time: showtime.startTime,
          end_time: showtime.endTime,
          room_name: showtime.room.roomName,
          priceRegular: showtime.priceRegular,
          priceVIP: showtime.priceVIP,
          theater_id: showtime.theater.theaterId,
        });
      }

      const groupedMovies = Object.values(movieMap);
      setFilteredMovies(groupedMovies);

      const allDates = showtimes.map((s) => s.date.slice(0, 10));
      const uniqueDates = [...new Set(allDates)].sort(
        (a, b) => new Date(a) - new Date(b)
      );
      //setShowtimes(uniqueDates);
    } catch (error) {
      console.error("Lỗi khi gọi API suất chiếu:", error);
      setFilteredMovies([]);
      //setShowtimes([]);
    }
  }, [selectedTheater]);

  useEffect(() => {
    fetchShowtimes();
  }, [selectedTheater, fetchShowtimes]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!formData.theaterId) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/rooms/theater/${formData.theaterId}`
        );
        let data = await res.json();

        data.sort((a, b) => {
          const nameA = a.room_name;
          const nameB = b.room_name;
          const numberA = parseInt(nameA.match(/\d+/));
          const numberB = parseInt(nameB.match(/\d+/));
          if (!isNaN(numberA) && !isNaN(numberB)) {
            if (numberA !== numberB) return numberA - numberB;
            return nameA.length - nameB.length;
          }
          if (!isNaN(numberA)) return -1;
          if (!isNaN(numberB)) return 1;
          return nameA.localeCompare(nameB);
        });

        setRooms(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phòng:", err);
      }
    };
    fetchRooms();
  }, [formData.theaterId]);

  const validateStartTime = (startTime) => {
    const [hour, minute] = startTime.split(":").map(Number);
    return !(hour < 9 || hour > 23 || (hour === 23 && minute > 45));
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
      priceRegular: parseFloat(formData.priceRegular),
      priceVIP: parseFloat(formData.priceVIP),
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/showtimes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();

      if (res.ok) {
        setMessage("Tạo suất chiếu thành công!");
        setFormData({
          movieId: "",
          theaterId: "",
          roomId: "",
          date: "",
          startTime: "",
          priceRegular: "",
          priceVIP: "",
        });
        onAddSuccess?.();
        onClose();
      } else {
        setMessage(`Lỗi: ${result.error}`);
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu tạo suất chiếu:", err);
      setMessage("Đã xảy ra lỗi không xác định.");
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setRawDate(date);
    const [year, month, day] = date.split("-");
    if (year && month && day) {
      setFormattedDate(`${day}/${month}/${year}`);
      setFormData((prev) => ({ ...prev, date }));
    }
  };

  const openDatePicker = () => {
    hiddenDateRef.current.showPicker?.();
  };

  const movieOptions = movies.map((m) => ({
    value: m._id,
    label: m.title,
  }));

  const theaterOptions = theaters.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const roomOptions = rooms.map((r) => ({
    value: r.id,
    label: r.room_name,
  }));

  return (
    <div className="add-showtime-wrapper">
      <div className="add-showtime-container">
        <span className="add-showtime-close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Tạo suất chiếu mới</h2>
        <div className="add-showtime-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Phim:</label>
              <Select
                options={movieOptions}
                value={movieOptions.find((m) => m.value === formData.movieId)}
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, movieId: selected.value }))
                }
                placeholder="-- Chọn phim --"
              />
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  required
                  step="900"
                  min="09:00"
                  max="23:45"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rạp:</label>
              <Select
                options={theaterOptions}
                value={theaterOptions.find(
                  (t) => t.value === formData.theaterId
                )}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    theaterId: selected.value,
                    roomId: "", // reset room khi đổi rạp
                  }));

                  // Cập nhật selectedTheater ở đây
                  const theaterObj = theaters.find(
                    (t) => t.id === selected.value
                  );
                  setSelectedTheater(theaterObj || null);
                }}
                placeholder="-- Chọn rạp --"
              />
            </div>

            <div className="form-group">
              <label>Phòng chiếu:</label>
              <Select
                options={roomOptions}
                value={roomOptions.find((r) => r.value === formData.roomId)}
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, roomId: selected.value }))
                }
                placeholder="-- Chọn phòng --"
                isDisabled={!formData.theaterId}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Giá ghế Thường:</label>
                <input
                  type="number"
                  value={formData.priceRegular}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceRegular: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Giá ghế VIP:</label>
                <input
                  type="number"
                  value={formData.priceVIP}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceVIP: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <button type="submit">Tạo suất chiếu</button>
          </form>
        </div>

        {message && <p className="form-message">{message}</p>}
      </div>
      <div className="schedule-wrapper">
        <ScheduleChart
          filteredMovies={filteredMovies}
          onClose={onClose}
          initialSelectedDate={rawDate}
          isOverlay={false}
        />
      </div>
    </div>
  );
};

export default AddShowtimeComponent;
