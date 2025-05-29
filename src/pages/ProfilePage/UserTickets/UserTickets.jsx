import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieAgeBadge from "../../../components/MovieAgeBadge/MovieAgeBadge";
import TicketDetails from "../../../components/TicketDetails/TicketDetails";
import "./UserTickets.css";

const UserTickets = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingsWithDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings/user/${userId}`
        );
        const bookingsData = res.data;

        const bookingsWithDetails = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const showtimeRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/showtimes/${booking.showtime_id}`
              );
              const showtime = showtimeRes.data.showtime;

              let movie = null;
              try {
                const movieRes = await axios.get(
                  `${process.env.REACT_APP_API_URL}/api/movies/${showtime.movie.movieId}`
                );
                movie = movieRes.data;
                console.log("movie", movie);
              } catch (err) {
                console.warn(
                  `Không lấy được phim ${showtime.movie.movieId}`,
                  err
                );
              }

              return { ...booking, showtime, movie };
            } catch (err) {
              console.error(
                `Lỗi khi lấy suất chiếu cho booking ${booking.id}:`,
                err
              );
              return { ...booking, showtime: null, movie: null };
            }
          })
        );

        setBookings(bookingsWithDetails);
      } catch (err) {
        setError("Không thể tải danh sách vé.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchBookingsWithDetails();
  }, [userId]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const formatShowtime = (isoDateString) => {
    const date = new Date(isoDateString);

    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const weekday = date.toLocaleDateString("vi-VN", {
      weekday: "long",
    });

    const fullDate = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${time} - ${capitalizeFirstLetter(weekday)}, ${fullDate}`;
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleDetailClick = (booking) => {
    setSelectedBooking(booking);
  };

  return (
    <div className="user-bookings-container">
      <h2>Danh sách vé đã đặt</h2>
      {bookings.length === 0 ? (
        <p>Bạn chưa đặt vé nào.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="booking-item"
              onClick={() => handleDetailClick(booking)}
              style={{ cursor: "pointer" }}
            >
              {booking.showtime ? (
                <>
                  <div className="movie-info-container">
                    <img
                      src={`${process.env.REACT_APP_API_URL}/movies/${booking.movie?.poster}`}
                      alt="Poster phim"
                      className="booking-detail-movie-poster"
                    />

                    <div className="movie-info-columns">
                      <div className="left-column">
                        <div className="movie-title">
                          {booking.movie?.title}
                        </div>
                        <div className="movie-age-badge-wrapper">
                          <MovieAgeBadge age={booking.movie?.age} />
                        </div>
                      </div>
                      <div className="right-column">
                        <div className="right-column-content">
                          <div className="theater-info">
                            {booking.showtime.theater.theaterName} -{" "}
                            {booking.showtime.room.roomName}
                          </div>
                          <div className="showtime-info">
                            {formatShowtime(booking.showtime.startTime)}
                          </div>
                        </div>
                        <button
                          className="booking-details-button"
                          onClick={() => handleDetailClick(booking.id)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <em>Không lấy được thông tin suất chiếu.</em>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedBooking && (
        <TicketDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default UserTickets;
