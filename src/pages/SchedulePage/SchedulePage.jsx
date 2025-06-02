import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import ScheduleChart from "../../components/ScheduleChart/ScheduleChart";
import DateFilter from "../../components/DateFilter/DateFilter";
import AddShowtimeComponent from "../../components/AddShowtimeComponent/AddShowtimeComponent";
import { MdDeleteOutline } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";
import "./SchedulePage.css";

const SchedulePage = () => {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isAddShowtimeVisible, setIsAddShowtimeVisible] = useState(false);
  const [isScheduleChartVisible, setIsScheduleChartVisible] = useState(false);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/theaters`
        );
        const data = await response.json();
        setTheaters(data);
        if (data.length > 0) {
          setSelectedTheater(data[0]);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
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
        setShowtimes([]);
        setSelectedDate("");
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
          rawShowtime: showtime, // lưu bản gốc để log
        });
      }

      const groupedMovies = Object.values(movieMap);
      setFilteredMovies(groupedMovies);

      const allDates = showtimes.map((s) => s.date.slice(0, 10));
      const uniqueDates = [...new Set(allDates)].sort(
        (a, b) => new Date(a) - new Date(b)
      );
      setShowtimes(uniqueDates);
      setSelectedDate(uniqueDates[0]);
    } catch (error) {
      console.error("Lỗi khi gọi API suất chiếu:", error);
      setFilteredMovies([]);
      setShowtimes([]);
      setSelectedDate("");
    }
  }, [selectedTheater]);

  useEffect(() => {
    fetchShowtimes();
  }, [selectedTheater, fetchShowtimes]);

  const formatTimeToVietnam = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh", // múi giờ Việt Nam
    });
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm("Bạn có chắc muốn xoá suất chiếu này?")) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/showtimes/${showtimeId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Lỗi xoá suất chiếu: ${errorData.error}`);
        return;
      }

      // Cập nhật filteredMovies bằng cách lọc suất chiếu đã xoá
      const updatedMovies = filteredMovies
        .map((movie) => ({
          ...movie,
          showtimes: movie.showtimes.filter((s) => s._id !== showtimeId),
        }))
        .filter((movie) => movie.showtimes.length > 0);

      setFilteredMovies(updatedMovies);
      alert("Đã xoá suất chiếu thành công.");
    } catch (error) {
      console.error("Lỗi khi gọi API xoá:", error);
      alert("Đã có lỗi xảy ra khi xoá suất chiếu.");
    }
  };

  const toggleAddShowtimeModal = () => {
    setIsAddShowtimeVisible(!isAddShowtimeVisible);
  };

  const toggleScheduleChart = () => {
    setIsScheduleChartVisible(!isScheduleChartVisible);
  };

  return (
    <div className="schedule-page">
      {loading ? (
        <p>Đang tải dữ liệu rạp chiếu...</p>
      ) : (
        <>
          <h2>Quản lý lịch chiếu</h2>
          <div className="schedule-filter">
            <label>Chọn rạp:</label>
            <div className="schedule-filter-item">
              <Select
                options={theaters.map((theater) => ({
                  value: theater.id,
                  label: theater.name,
                }))}
                onChange={(option) =>
                  setSelectedTheater(
                    theaters.find((t) => t.id === option.value)
                  )
                }
                placeholder="Chọn rạp"
                value={
                  selectedTheater
                    ? { value: selectedTheater.id, label: selectedTheater.name }
                    : null
                }
              />
            </div>
          </div>

          <div>
            <h3>Lịch chiếu</h3>
            <div className="schedule-toolbar">
              <DateFilter
                showtimes={showtimes}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <button
                className="add-showtime-button"
                onClick={toggleAddShowtimeModal}
              >
                Thêm suất chiếu
              </button>

              <button
                className="view-chart-button"
                onClick={toggleScheduleChart}
              >
                <IoCalendarOutline />
                Lịch phòng
              </button>
            </div>

            <hr className="schedule-divider" />

            <div className="schedule">
              {filteredMovies.length > 0 ? (
                filteredMovies
                  .filter((movie) =>
                    movie.showtimes.some(
                      (showtime) => showtime.date === selectedDate
                    )
                  )
                  .map((movie, movieIndex) => (
                    <div key={movieIndex} className="movie">
                      <h3>{movie.title}</h3>
                      <table>
                        <thead>
                          <tr>
                            <th>Giờ bắt đầu</th>
                            <th>Giờ kết thúc</th>
                            <th>Phòng chiếu</th>
                            <th>Giá ghế thường</th>
                            <th>Giá ghế VIP</th>
                            <th>Xóa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movie.showtimes
                            .filter(
                              (showtime) => showtime.date === selectedDate
                            )
                            .map((showtime, showtimeIndex) => (
                              <tr key={showtimeIndex}>
                                <td>
                                  {formatTimeToVietnam(showtime.start_time)}
                                </td>
                                <td>
                                  {formatTimeToVietnam(showtime.end_time)}
                                </td>
                                <td>{showtime.room_name}</td>

                                <td>
                                  {showtime.priceRegular.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  đ
                                </td>
                                <td>
                                  {showtime.priceVIP.toLocaleString("vi-VN")} đ
                                </td>
                                <td>
                                  <button
                                    className="delete-showtime-button"
                                    onClick={() =>
                                      handleDeleteShowtime(showtime._id)
                                    }
                                  >
                                    <MdDeleteOutline />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ))
              ) : (
                <p>Chưa có lịch chiếu cho ngày này.</p>
              )}
            </div>
          </div>

          {isScheduleChartVisible && (
            <div className="schedule-overlay">
              <ScheduleChart
                filteredMovies={filteredMovies}
                onClose={toggleScheduleChart}
                initialSelectedDate={selectedDate}
              />
            </div>
          )}
          {isAddShowtimeVisible && (
            <div className="schedule-overlay">
              <AddShowtimeComponent
                theaterId={selectedTheater?.id}
                onClose={toggleAddShowtimeModal}
                onAddSuccess={fetchShowtimes}
                scheduleMovies={filteredMovies}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SchedulePage;
