import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import ScheduleChart from "./components/ScheduleChart/ScheduleChart";
import { useSelector } from "react-redux";
import DateFilter from "../../components/DateFilter/DateFilter";
import AddShowtimeComponent from "./components/AddShowtimeComponent/AddShowtimeComponent";
import UpdatePriceModal from "./components/UpdatePriceModal/UpdatePriceModal";
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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedShowtimes, setSelectedShowtimes] = useState(new Set());
  const [isUpdatePriceModalVisible, setIsUpdatePriceModalVisible] =
    useState(false);
  const user = useSelector((state) => state.user);

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

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
          showtimeType: showtime.showtimeType,
          rawShowtime: showtime,
        });
      }
      const groupedMovies = Object.values(movieMap);
      groupedMovies.forEach((movie) => {
        movie.showtimes.sort((a, b) =>
          a.showtimeType.localeCompare(b.showtimeType)
        );
      });
      setFilteredMovies(groupedMovies);

      const allDates = showtimes.map((s) => s.date.slice(0, 10));
      const uniqueDates = [...new Set(allDates)].sort(
        (a, b) => new Date(a) - new Date(b)
      );
      setShowtimes(uniqueDates);
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
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const handleDeleteSelectedShowtimes = async () => {
    if (!window.confirm("Bạn có chắc muốn xoá các suất chiếu đã chọn?")) return;
    const promises = Array.from(selectedShowtimes).map((id) =>
      fetch(`${process.env.REACT_APP_API_URL}/api/showtimes/${id}`, {
        method: "DELETE",
      })
    );
    await Promise.all(promises);
    setSelectedShowtimes(new Set());
    fetchShowtimes();
  };

  const toggleAddShowtimeModal = () => {
    setIsAddShowtimeVisible(!isAddShowtimeVisible);
  };

  const toggleScheduleChart = () => {
    setIsScheduleChartVisible(!isScheduleChartVisible);
  };

  const toggleSelectShowtime = (id) => {
    const newSet = new Set(selectedShowtimes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedShowtimes(newSet);
  };

  const selectAllShowtimesInDate = () => {
    const newSet = new Set();
    filteredMovies.forEach((movie) => {
      movie.showtimes.forEach((s) => {
        if (s.date === selectedDate) newSet.add(s._id);
      });
    });
    setSelectedShowtimes(newSet);
  };

  const selectAllShowtimesInMovie = (movie) => {
    const newSet = new Set(selectedShowtimes);
    movie.showtimes.forEach((s) => {
      if (s.date === selectedDate) newSet.add(s._id);
    });
    setSelectedShowtimes(newSet);
  };

  const areAllShowtimesSelectedInDate = () => {
    let count = 0;
    filteredMovies.forEach((movie) => {
      movie.showtimes.forEach((s) => {
        if (s.date === selectedDate) count++;
      });
    });
    return selectedShowtimes.size > 0 && selectedShowtimes.size === count;
  };

  const unselectAllShowtimesInDate = () => {
    const newSet = new Set(selectedShowtimes);
    filteredMovies.forEach((movie) => {
      movie.showtimes.forEach((s) => {
        if (s.date === selectedDate) newSet.delete(s._id);
      });
    });
    setSelectedShowtimes(newSet);
  };

  const areAllShowtimesSelectedInMovie = (movie) => {
    const movieShowtimes = movie.showtimes.filter(
      (s) => s.date === selectedDate
    );
    return (
      movieShowtimes.length > 0 &&
      movieShowtimes.every((s) => selectedShowtimes.has(s._id))
    );
  };

  const unselectAllShowtimesInMovie = (movie) => {
    const newSet = new Set(selectedShowtimes);
    movie.showtimes.forEach((s) => {
      if (s.date === selectedDate) newSet.delete(s._id);
    });
    setSelectedShowtimes(newSet);
  };

  const handleUpdatePrices = async ({ priceRegular, priceVIP }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/showtimes/update-prices`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            showtimeIds: Array.from(selectedShowtimes),
            priceRegular,
            priceVIP,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        alert("Lỗi cập nhật giá: " + err.error);
      } else {
        fetchShowtimes();
        setSelectedShowtimes(new Set());
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật giá:", err);
      alert("Lỗi hệ thống khi cập nhật giá");
    } finally {
      setIsUpdatePriceModalVisible(false);
    }
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
          <div className="schedule-toolbar">
            {user?.role === "admin" && (
              <button
                className="add-showtime-button"
                onClick={toggleAddShowtimeModal}
              >
                Thêm suất chiếu
              </button>
            )}

            <button className="view-chart-button" onClick={toggleScheduleChart}>
              <IoCalendarOutline /> Lịch phòng
            </button>
          </div>
          <div>
            <h3>Lịch chiếu</h3>
            <div className="schedule-toolbar">
              <DateFilter
                showtimes={showtimes}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
            <hr className="schedule-divider" />
            <div className="schedule-controls">
              <div className="left-controls">
                <input
                  type="text"
                  placeholder="Tìm phim..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="employee-search-input"
                />
                <button
                  className="update-showtime-button"
                  onClick={() => setIsUpdatePriceModalVisible(true)}
                  disabled={selectedShowtimes.size === 0}
                >
                  Cập nhật giá vé
                </button>

                <button
                  className="delete-showtime-button"
                  onClick={handleDeleteSelectedShowtimes}
                  disabled={selectedShowtimes.size === 0}
                >
                  Xoá các suất đã chọn
                </button>
              </div>

              <div className="right-controls">
                {areAllShowtimesSelectedInDate() ? (
                  <button
                    className="select-toggle-button"
                    onClick={unselectAllShowtimesInDate}
                  >
                    Bỏ chọn tất cả
                  </button>
                ) : (
                  <button
                    className="select-toggle-button"
                    onClick={selectAllShowtimesInDate}
                  >
                    Chọn tất cả
                  </button>
                )}
              </div>
            </div>

            <div className="schedule">
              {filteredMovies.length > 0 ? (
                filteredMovies
                  .filter(
                    (movie) =>
                      removeVietnameseTones(movie.title.toLowerCase()).includes(
                        removeVietnameseTones(searchKeyword.toLowerCase())
                      ) &&
                      movie.showtimes.some(
                        (showtime) => showtime.date === selectedDate
                      )
                  )
                  .map((movie, movieIndex) => (
                    <div key={movieIndex} className="movie">
                      <div className="movie-header">
                        <h3>{movie.title}</h3>
                        {areAllShowtimesSelectedInMovie(movie) ? (
                          <button
                            className="select-toggle-button"
                            onClick={() => unselectAllShowtimesInMovie(movie)}
                          >
                            Bỏ chọn tất cả
                          </button>
                        ) : (
                          <button
                            className="select-toggle-button"
                            onClick={() => selectAllShowtimesInMovie(movie)}
                          >
                            Chọn tất cả
                          </button>
                        )}
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th>Loại</th>
                            <th>Giờ bắt đầu</th>
                            <th>Giờ kết thúc</th>
                            <th>Phòng chiếu</th>
                            <th>Giá ghế thường</th>
                            <th>Giá ghế VIP</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {movie.showtimes
                            .filter(
                              (showtime) => showtime.date === selectedDate
                            )
                            .map((showtime, showtimeIndex) => (
                              <tr key={showtimeIndex}>
                                <td>{showtime.showtimeType}</td>
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
                                  <input
                                    type="checkbox"
                                    checked={selectedShowtimes.has(
                                      showtime._id
                                    )}
                                    onChange={() =>
                                      toggleSelectShowtime(showtime._id)
                                    }
                                  />
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
                onChangeTheater={(theaterId) => {
                  const theater = theaters.find((t) => t.id === theaterId);
                  if (theater) setSelectedTheater(theater);
                }}
                scheduleMovies={filteredMovies}
              />
            </div>
          )}
          {isUpdatePriceModalVisible && (
            <div className="schedule-overlay">
              <UpdatePriceModal
                onClose={() => setIsUpdatePriceModalVisible(false)}
                onSubmit={handleUpdatePrices}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SchedulePage;
