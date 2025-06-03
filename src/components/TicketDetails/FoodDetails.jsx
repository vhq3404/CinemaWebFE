import React from "react";
import { QRCodeSVG } from "qrcode.react";
import popcornImage from "../../assets/Popcorn.png";
import "./TicketDetails.css";

const FoodDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDateTime = (isoDateString) => {
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

  const qrData = `${booking.id}`;

  const totalBeforeDiscount = booking.items.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );

  const discountAmount = totalBeforeDiscount - booking.total_price;
  const formatCurrency = (number) =>
    number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

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
          <img
            src={popcornImage}
            alt="Popcorn"
            className="modal-movie-poster"
            style={{ objectFit: "contain" }}
          />

          <div className="ticket-info">
            <h3>Mã đơn: #{booking.id}</h3>
            <p>{formatDateTime(booking.created_at)}</p>
          </div>
        </div>

        <div className="ticket-divider"></div>

        <div className="qr-code-container">
          <QRCodeSVG value={qrData} level="L" size={200} />
        </div>

        <div className="ticket-divider"></div>

        <ul>
          {booking.items.map((item, index) => (
            <li key={index}>
              {item.food_name} × {item.quantity}:{" "}
              {formatCurrency(item.unit_price)}
            </li>
          ))}
        </ul>
        <div className="ticket-divider"></div>

        <div className="ticket-info">
          {discountAmount > 0 && (
            <p>
              <strong>Giảm giá:</strong> -{formatCurrency(discountAmount)}
            </p>
          )}
          <p>
            <strong>Tổng cộng:</strong>{" "}
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
  );
};

export default FoodDetails;
