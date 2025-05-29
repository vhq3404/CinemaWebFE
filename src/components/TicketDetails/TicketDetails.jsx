import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieAgeBadge from "../MovieAgeBadge/MovieAgeBadge";
import { QRCodeSVG } from "qrcode.react";
import "./TicketDetails.css";

const TicketDetails = ({ booking, onClose }) => {
  const [seatDetails, setSeatDetails] = useState([]);

  useEffect(() => {
    const fetchSeatDetails = async () => {
      if (!booking?.seat_ids || booking.seat_ids.length === 0) return;

      try {
        const promises = booking.seat_ids.map((id) =>
          axios.get(`${process.env.REACT_APP_API_URL}/api/seats/${id}`)
        );
        const responses = await Promise.all(promises);
        const seats = responses.map((res) => res.data);
        setSeatDetails(seats);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin ghế:", err);
      }
    };

    fetchSeatDetails();
  }, [booking]);

  if (!booking) return null;

  const formatShowtime = (isoDateString) => {
    const date = new Date(isoDateString);
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const weekday = date.toLocaleDateString("vi-VN", { weekday: "long" });
    const fullDate = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} - ${
      weekday.charAt(0).toUpperCase() + weekday.slice(1)
    }, ${fullDate}`;
  };

  const qrData = JSON.stringify({
    bookingId: booking.id,
    movieTitle: booking.movie?.title,
    showtime: booking.showtime.startTime,
    theater: booking.showtime.theater.theaterName,
    room: booking.showtime.room.roomName,
    seats: seatDetails
      .sort((a, b) => {
        if (a.row_label === b.row_label) return a.column_index - b.column_index;
        return a.row_label.localeCompare(b.row_label);
      })
      .map((seat) => seat.seat_number)
      .join(","),
  });

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div
        className="ticket-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="ticket-modal-body">
          {/* Poster bên trái */}
          <img
            src={`${process.env.REACT_APP_API_URL}/movies/${booking.movie?.poster}`}
            alt="Poster"
            className="modal-movie-poster"
          />

          {/* Thông tin bên phải */}
          <div className="ticket-info">
            <h3>{booking.movie?.title}</h3>
            <div className="ticket-movie-age-badge-wrapper">
              <MovieAgeBadge age={booking.movie?.age} />
            </div>
            <p>
              <strong>Suất chiếu:</strong>{" "}
              {formatShowtime(booking.showtime.startTime)}
            </p>
            <p>
              <strong>Rạp:</strong> {booking.showtime.theater.theaterName} -{" "}
              {booking.showtime.room.roomName}
            </p>
          </div>
        </div>
        <div className="ticket-divider"></div>
        <div className="qr-code-container">
          <QRCodeSVG value={qrData} level="L" size={200} />
        </div>
        <div className="ticket-divider"></div>
        <div className="ticket-info">
          {seatDetails.length > 0 ? (
            <p>
              <strong>Ghế:</strong>{" "}
              {seatDetails
                .sort((a, b) => {
                  if (a.row_label === b.row_label) {
                    return a.column_index - b.column_index;
                  }
                  return a.row_label.localeCompare(b.row_label);
                })
                .map((seat) => seat.seat_number)
                .join(", ")}
            </p>
          ) : (
            <p>Đang tải thông tin ghế...</p>
          )}

          <div className="price-cancel-wrapper">
            <p>
              <strong>Giá:</strong>{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              })
                .format(booking.total_price)
                .replace("₫", "")}
              <u>đ</u>
            </p>
            <button className="ticket-cancel-button" onClick={() => alert("Hủy vé")}>
              Hủy vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
