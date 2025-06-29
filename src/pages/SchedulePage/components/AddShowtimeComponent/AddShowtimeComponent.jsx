import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import { FaRegCalendarAlt } from "react-icons/fa";
import ScheduleChart from "../ScheduleChart/ScheduleChart";
import "./AddShowtimeComponent.css";

const AddShowtimeComponent = ({
  onClose,
  onAddSuccess,
  scheduleMovies,
  onChangeTheater,
}) => {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  //const [showtimes, setShowtimes] = useState([]);
  const [rawDate, setRawDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const hiddenDateRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    movieId: "",
    theaterId: "",
    startDate: "",
    endDate: "",
    showtimeType: "",
    showtimesPerDay: [],
    priceRegular: "",
    priceVIP: "",
    priceRegularWeekend: "",
    priceVIPWeekend: "",
  });

  const resetFormData = () => {
    setFormData({
      movieId: "",
      theaterId: "",
      startDate: "",
      endDate: "",
      showtimeType: "",
      showtimesPerDay: [],
      priceRegular: "",
      priceVIP: "",
      priceRegularWeekend: "",
      priceVIPWeekend: "",
    });
  };

  const showtimeTypeOptions = [
    { value: "2D Lồng tiếng", label: "2D Lồng tiếng" },
    { value: "2D Phụ đề", label: "2D Phụ đề" },
    { value: "3D Lồng tiếng", label: "3D Lồng tiếng" },
    { value: "3D Phụ đề", label: "3D Phụ đề" },
    { value: "IMAX Phụ đề", label: "IMAX Phụ đề" },
    { value: "IMAX Lồng tiếng", label: "IMAX Lồng tiếng" },
  ];

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
        setErrorMessage("Không thể tải danh sách phim.");
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
        setErrorMessage("Không thể tải danh sách rạp.");
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
        return;
      }

      const showtimes = data.showtimes;

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
          showtimeType: showtime.showtimeType,
          room_name: showtime.room.roomName,
          priceRegular: showtime.priceRegular,
          priceVIP: showtime.priceVIP,
          theater_id: showtime.theater.theaterId,
        });
      }

      setFilteredMovies(Object.values(movieMap));
    } catch (error) {
      console.error("Lỗi khi gọi API suất chiếu:", error);
      setFilteredMovies([]);
      setErrorMessage("Không thể tải suất chiếu.");
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
        setErrorMessage("Không thể tải danh sách phòng.");
      }
    };
    fetchRooms();
  }, [formData.theaterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    if (formData.showtimesPerDay.length === 0) {
      setMessage("Vui lòng chọn ít nhất một giờ chiếu trong ngày.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      theaterId: parseInt(formData.theaterId),
      priceRegular: parseFloat(formData.priceRegular),
      priceVIP: parseFloat(formData.priceVIP),
      priceRegularWeekend: parseFloat(formData.priceRegularWeekend) || null,
      priceVIPWeekend: parseFloat(formData.priceVIPWeekend) || null,
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/showtimes/generate-showtimes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();

      if (res.ok) {
        setMessage("Tạo các suất chiếu thành công!");
        setErrorMessage("");
        const currentSelectedDate = rawDate;
        const correctTheater = theaters.find(
          (t) => t.id === parseInt(formData.theaterId)
        );
        setSelectedTheater(correctTheater || null);

        if (onChangeTheater && correctTheater) {
          onChangeTheater(correctTheater.id);
        }

        setTimeout(async () => {
          await fetchShowtimes();
          setRawDate(currentSelectedDate);
        }, 0);
        onAddSuccess?.();
      } else {
        setErrorMessage(`Lỗi: ${result.error}`);
        setMessage("");
      }
    } catch (err) {
      console.error("Lỗi gửi yêu cầu:", err);
      setErrorMessage("Không thể gửi yêu cầu tạo suất chiếu.");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDatePicker = () => {
    hiddenDateRef.current.showPicker?.();
  };

  const formatNumber = (value) => {
    if (!value) return "";
    const cleanedValue = value.toString().replace(/[.,]/g, "");
    return cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (value) => {
    return value.replace(/[.,]/g, "");
  };

  const movieOptions = movies.map((m) => ({ value: m._id, label: m.title }));
  const theaterOptions = theaters.map((t) => ({ value: t.id, label: t.name }));
  const roomOptions = rooms.map((r) => ({ value: r.id, label: r.room_name }));

  return (
    <div className="add-showtime-wrapper">
      <div className="add-showtime-container">
        <span
          className="add-showtime-close-btn"
          onClick={() => {
            resetFormData();
            onClose();
          }}
        >
          &times;
        </span>
        <h2>Tạo suất chiếu mới</h2>
        <div className="add-showtime-content">
          <form onSubmit={handleSubmit}>
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
            <div className="form-group">
              <label>Loại suất chiếu:</label>
              <Select
                options={showtimeTypeOptions}
                value={showtimeTypeOptions.find(
                  (opt) => opt.value === formData.showtimeType
                )}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    showtimeType: selected.value,
                  }))
                }
                placeholder="-- Chọn loại suất chiếu --"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Suất chiếu:</label>
              <Select
                isMulti
                options={[
                  "09:00",
                  "09:15",
                  "09:30",
                  "09:45",
                  "10:00",
                  "10:15",
                  "10:30",
                  "10:45",
                  "11:00",
                  "11:15",
                  "11:30",
                  "11:45",
                  "12:00",
                  "12:15",
                  "12:30",
                  "12:45",
                  "13:00",
                  "13:15",
                  "13:30",
                  "13:45",
                  "14:00",
                  "14:15",
                  "14:30",
                  "14:45",
                  "15:00",
                  "15:15",
                  "15:30",
                  "15:45",
                  "16:00",
                  "16:15",
                  "16:30",
                  "16:45",
                  "17:00",
                  "17:15",
                  "17:30",
                  "17:45",
                  "18:00",
                  "18:15",
                  "18:30",
                  "18:45",
                  "19:00",
                  "19:15",
                  "19:30",
                  "19:45",
                  "20:00",
                  "20:15",
                  "20:30",
                  "20:45",
                  "21:00",
                  "21:15",
                  "21:30",
                  "21:45",
                  "22:00",
                  "22:15",
                  "22:30",
                  "22:45",
                  "23:00",
                ].map((time) => ({ value: time, label: time }))}
                value={formData.showtimesPerDay.map((time) => ({
                  value: time,
                  label: time,
                }))}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    showtimesPerDay: selected.map((s) => s.value),
                  }))
                }
                placeholder="-- Chọn giờ chiếu --"
              />
            </div>

            {/* <div className="form-group">
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
            </div> */}
            <div className="form-row">
              <div className="form-group">
                <label>Giá ghế Thường:</label>
                <input
                  type="text"
                  value={formatNumber(formData.priceRegular)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceRegular: parseNumber(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Giá ghế VIP:</label>
                <input
                  type="text"
                  value={formatNumber(formData.priceVIP)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceVIP: parseNumber(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Giá ghế Thường (T7/CN):</label>
                <input
                  type="text"
                  value={formatNumber(formData.priceRegularWeekend)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceRegularWeekend: parseNumber(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Giá ghế VIP (T7/CN):</label>
                <input
                  type="text"
                  value={formatNumber(formData.priceVIPWeekend)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priceVIPWeekend: parseNumber(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo suất chiếu"}
            </button>
          </form>
        </div>
        {message && (
          <p
            className="form-message"
            style={{ color: "green", marginTop: "10px" }}
          >
            {message}
          </p>
        )}

        {errorMessage && (
          <p
            className="form-message"
            style={{ color: "red", marginTop: "10px" }}
          >
            {errorMessage}
          </p>
        )}
      </div>
      <div className="schedule-wrapper">
        <ScheduleChart
          filteredMovies={filteredMovies}
          onClose={onClose}
          initialSelectedDate={rawDate}
          isOverlay={false}
          theaterName={selectedTheater?.name}
        />
      </div>
    </div>
  );
};

export default AddShowtimeComponent;
