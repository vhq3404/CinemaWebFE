import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MovieAgeBadge from "../MovieAgeBadge/MovieAgeBadge";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import "./TicketPrint.css";

const TicketContent = React.forwardRef(
  ({ booking, seatDetails, formatShowtime, qrData }, ref) => (
    <div ref={ref}>
      <div className="ticket-modal-body">
        <div className="ticket-info">
          <h3>{booking.movie?.title}</h3>
          <div className="ticket-movie-age-badge-wrapper">
            <MovieAgeBadge age={booking.movie?.age} />
          </div>
          {booking.showtime.showtimeType}
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
        <p>
          <strong>Ghế:</strong>{" "}
          {seatDetails
            .sort(
              (a, b) =>
                a.row_label.localeCompare(b.row_label) ||
                a.column_index - b.column_index
            )
            .map((seat) => seat.seat_number)
            .join(", ")}
        </p>
        <div
          className="price-cancel-wrapper"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
        </div>
      </div>
    </div>
  )
);

const TicketPrint = ({ booking, onClose }) => {
  const [seatDetails, setSeatDetails] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    const fetchSeatDetails = async () => {
      if (!booking?.seat_ids || booking.seat_ids.length === 0) return;
      try {
        const res = await Promise.all(
          booking.seat_ids.map((id) =>
            axios.get(`${process.env.REACT_APP_API_URL}/api/seats/${id}`)
          )
        );
        setSeatDetails(res.map((r) => r.data));
      } catch (err) {
        console.error("Lỗi khi lấy thông tin ghế:", err);
      }
    };
    fetchSeatDetails();
  }, [booking]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Ve-Xem-Phim",
  });

  console.log("printRef.current", printRef.current);

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

  const qrData = String(booking?.id);
  if (!booking) return null;

  return (
    <div className="user-ticket-modal-overlay" onClick={onClose}>
      <div
        className="print-ticket-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "none" }}>
            <TicketContent
              ref={printRef}
              booking={booking}
              seatDetails={seatDetails}
              formatShowtime={formatShowtime}
              qrData={qrData}
            />
          </div>

          {/* Nội dung hiển thị trước khi in */}
          <TicketContent
            booking={booking}
            seatDetails={seatDetails}
            formatShowtime={formatShowtime}
            qrData={qrData}
          />

          <div
            className="price-cancel-wrapper"
            style={{ justifyContent: "flex-end", marginTop: 12 }}
          >
            <button className="print-button" onClick={handlePrint}>
              In vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPrint;
