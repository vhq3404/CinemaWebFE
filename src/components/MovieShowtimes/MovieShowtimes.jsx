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

        const now = new Date();
        const groupedByDate = {};

        for (const showtime of data.showtimes) {
          const showtimeDateStr = showtime.date.slice(0, 10);
          const startTime = new Date(showtime.startTime);

          // Chỉ giữ suất chiếu trong tương lai
          if (startTime > now) {
            const theaterName = showtime.theater.theaterName;

            if (!groupedByDate[showtimeDateStr])
              groupedByDate[showtimeDateStr] = {};
            if (!groupedByDate[showtimeDateStr][theaterName])
              groupedByDate[showtimeDateStr][theaterName] = [];

            groupedByDate[showtimeDateStr][theaterName].push(showtime);
          }
        }

        // Chỉ giữ ngày có ít nhất một suất chiếu hợp lệ
        const dates = Object.keys(groupedByDate).sort(
          (a, b) => new Date(a) - new Date(b)
        );

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
                <div className="showtimes-table-structured">
                  {Object.entries(showtimesByTheater[selectedDate] || {}).map(
                    ([theaterName, showtimes], index) => {
                      const groupedByType = showtimes.reduce(
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
                          {typeEntries.map(([type, times], i) => (
                            <div
                              key={`${index}-${i}`}
                              className="showtimes-row"
                            >
                              <div className="theater-name-cell">
                                {i === 0 ? theaterName : ""}
                              </div>
                              <div className="format-type-cell">{type}</div>
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

export default MovieShowtimes;
