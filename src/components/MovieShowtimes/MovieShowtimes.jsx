import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DateFilter from "../../components/DateFilter/DateFilter";
import AuthModal from "../../components/AuthModal/AuthModal";

import "./MovieShowtimes.css";

const MovieShowtimes = ({ movieId }) => {
  const [showtimesByTheater, setShowtimesByTheater] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingShowtime, setPendingShowtime] = useState(null);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtimes = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/showtimes?movieId=${movieId}`
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Lỗi dữ liệu");

        // Lọc và gom theo ngày và theo rạp
        const groupedByDate = {};

        for (const showtime of data.showtimes) {
          const date = showtime.date.slice(0, 10); // yyyy-mm-dd
          const theaterName = showtime.theater.theaterName;

          if (!groupedByDate[date]) {
            groupedByDate[date] = {};
          }

          if (!groupedByDate[date][theaterName]) {
            groupedByDate[date][theaterName] = [];
          }

          groupedByDate[date][theaterName].push(showtime);
        }

        // const dates = Object.keys(groupedByDate).sort(
        //   (a, b) => new Date(a) - new Date(b)
        // );
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset về 00:00:00

        const dates = Object.keys(groupedByDate)
          .filter((dateStr) => {
            const date = new Date(dateStr);
            return date >= today;
          })
          .sort((a, b) => new Date(a) - new Date(b));

        setAvailableDates(dates);
        setSelectedDate(dates[0] || "");
        setShowtimesByTheater(groupedByDate);
      } catch (error) {
        console.error("Lỗi khi lấy suất chiếu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

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
            <label>Lịch chiếu</label>
            {availableDates.length > 0 ? (
              <>
                <DateFilter
                  showtimes={availableDates}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
                <hr className="schedule-divider" />
                <div className="showtimes-table">
                  {Object.entries(showtimesByTheater[selectedDate] || {}).map(
                    ([theaterName, times], index) => (
                      <div key={index} className="theater-row">
                        <div className="theater-name-col">
                          <div className="showtime-theater-name">
                            {theaterName}
                          </div>
                        </div>
                        <div className="showtimes-col">
                          <div className="showtimes">
                            {times.map((showtime, idx) => (
                              <span
                                key={idx}
                                className="showtime-badge"
                                onClick={() => handleShowtimeClick(showtime)}
                              >
                                {formatTime(showtime.startTime)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
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

export default MovieShowtimes;
