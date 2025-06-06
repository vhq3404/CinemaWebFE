import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DateFilter from "../../components/DateFilter/DateFilter";
import AuthModal from "../../components/AuthModal/AuthModal";
import "./TheaterShowtimes.css"; // Reuse same CSS for now

const TheaterShowtimes = ({ theaterId }) => {
  const [showtimesByMovie, setShowtimesByMovie] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingShowtime, setPendingShowtime] = useState(null);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  console.log("showtimesByMovie", showtimesByMovie);
  useEffect(() => {
    const fetchShowtimes = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/showtimes?theaterId=${theaterId}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Lỗi dữ liệu");

        const showtimes = data.showtimes;

        // Lấy tất cả movieId duy nhất từ danh sách showtimes
        const movieIds = [...new Set(showtimes.map((s) => s.movie.movieId))];

        // Gọi song song để lấy thông tin từng phim
        const movieDataMap = {};
        await Promise.all(
          movieIds.map(async (movieId) => {
            const movieRes = await fetch(
              `${process.env.REACT_APP_API_URL}/api/movies/${movieId}`
            );
            const movie = await movieRes.json();
            movieDataMap[movieId] = movie;
          })
        );

        const groupedByDate = {};

        for (const showtime of showtimes) {
          const date = showtime.date.slice(0, 10);
          const movieId = showtime.movie.movieId;
          const movie = movieDataMap[movieId];

          if (!groupedByDate[date]) groupedByDate[date] = {};
          if (!groupedByDate[date][movieId])
            groupedByDate[date][movieId] = {
              title: movie.title,
              poster: movie.poster,
              showtimes: [],
            };

          groupedByDate[date][movieId].showtimes.push(showtime);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dates = Object.keys(groupedByDate)
          .filter((dateStr) => new Date(dateStr) >= today)
          .sort((a, b) => new Date(a) - new Date(b));

        setAvailableDates(dates);
        setSelectedDate(dates[0] || "");
        setShowtimesByMovie(groupedByDate);
      } catch (error) {
        console.error("Lỗi khi lấy suất chiếu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [theaterId]);

  const handleShowtimeClick = (showtime) => {
    if (user) {
      navigate("/booking", { state: { showtime } });
    } else {
      setPendingShowtime(showtime);
      setShowLoginModal(true);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  return (
    <div>
      <div className="movie-showtimes-page">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            <label>Lịch chiếu của rạp</label>
            {availableDates.length > 0 ? (
              <>
                <DateFilter
                  showtimes={availableDates}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
                <hr className="schedule-divider" />
                <div className="showtimes-table-structured">
                  {Object.entries(showtimesByMovie[selectedDate] || {}).map(
                    ([movieId, movieData], index) => {
                      const groupedByType = movieData.showtimes.reduce(
                        (acc, showtime) => {
                          const type = showtime.showtimeType || "Khác";
                          if (!acc[type]) acc[type] = [];
                          acc[type].push(showtime);
                          return acc;
                        },
                        {}
                      );

                      const typeEntries = Object.entries(groupedByType);

                      return (
                        <div key={index} className="theater-group">
                          {/* Title nằm trên cùng */}
                          <div className="theater-movie-title">
                            {movieData.title}
                          </div>

                          {/* Hàng ngang chứa poster bên trái và showtimes bên phải */}
                          <div className="movie-poster-showtimes-row">
                            <img
                              src={`${process.env.REACT_APP_API_URL}/movies/${movieData.poster}`}
                              alt={movieData.title}
                              className="theater-movie-poster"
                            />
                            <div className="showtimes-container">
                              {typeEntries.map(([type, times], i) => (
                                <div
                                  key={`${index}-${i}`}
                                  className="showtimes-row"
                                >
                                  <div className="theater-format-type-cell">{type}</div>
                                  <div className="showtime-badges-cell">
                                    {times.map((showtime, idx) => (
                                      <span
                                        key={idx}
                                        className="showtime-badge"
                                        onClick={() =>
                                          handleShowtimeClick(showtime)
                                        }
                                      >
                                        {formatTime(showtime.startTime)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            ) : (
              <p>Chưa có lịch chiếu.</p>
            )}
          </>
        )}
      </div>
      {showLoginModal && (
        <AuthModal
          onClose={() => setShowLoginModal(false)}
          showtime={pendingShowtime}
          navigateAfterLogin={navigate}
        />
      )}
    </div>
  );
};

export default TheaterShowtimes;
