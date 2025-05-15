import React, { useEffect, useState } from "react";
import MovieAgeBadge from "../../components/MovieAgeBadge/MovieAgeBadge";
import "./BookingDetail.css";

const BookingDetail = ({ showtime, selectedSeats }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [age, setAge] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/movies/${showtime.movie.movieId}`
        );
        const data = await response.json();
        console.log("movie", data);
        setPosterUrl(data.poster);
        setAge(data.age);
      } catch (error) {
        console.error("Lỗi khi lấy poster phim:", error);
      }
    };

    if (showtime?.movie?.movieId) {
      fetchMovie();
    }
  }, [showtime]);

  if (!showtime) {
    return <p>Không có thông tin suất chiếu để hiển thị.</p>;
  }

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const formatDateWithWeekday = (dateStr) => {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const date = new Date(dateStr);
    const dayOfWeek = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };

  const getAgeDescription = (age) => {
    const ageDescriptions = {
      P: "Phim dành cho mọi đối tượng khán giả",
      T13: "Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+)",
      T16: "Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+)",
      T18: "[Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+)",
    };
    return ageDescriptions[age] || "";
  };

  const getSeatPrice = (seat) => {
    return seat.type === "vip" ? 100000 : 50000;
  };

  const formatCurrency = (number) =>
    number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  return (
    <div className="booking-detail">
      <h3>Thông tin vé</h3>
      {posterUrl && (
        <div className="booking-movie-header">
          <img
            src={`http://localhost:8080/movies/${posterUrl}`}
            alt="Poster phim"
            className="booking-movie-poster"
          />
          <div className="booking-movie-title">
            <div className="movie-booking-title">{showtime.movie.title}</div>
            {age !== "unrated" && (
              <div className="age-info">
                <MovieAgeBadge age={age} />
                <span className="age-description">
                  {getAgeDescription(age)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <p>
        <strong>Rạp:</strong> {showtime.theater.theaterName} -{" "}
        {showtime.room.roomName}
      </p>

      <p>
        <strong>Ngày:</strong> {formatDateWithWeekday(showtime.date)}
      </p>
      <p>
        <strong>Suất chiếu:</strong> {formatTime(showtime.startTime)}
      </p>
      {selectedSeats.length > 0 && (
        <>
          <hr className="booking-divider" />
          <h4>Ghế đã chọn ({selectedSeats.length}):</h4>
          <ul>
            {selectedSeats.map((seat) => (
              <li key={seat.seat_id}>
                {seat.seat_number} - {seat.type === "vip" ? "VIP" : "Thường"} -{" "}
                {formatCurrency(getSeatPrice(seat))}
              </li>
            ))}
          </ul>
          <hr className="booking-divider" />
          <div className="total-price">
            <div className="total-price-row">
              <h4>Tổng cộng:</h4>
              <div>{formatCurrency(totalPrice)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingDetail;
