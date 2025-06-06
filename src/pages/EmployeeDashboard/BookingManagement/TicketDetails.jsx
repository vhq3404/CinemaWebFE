import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieAgeBadge from "../../../components/MovieAgeBadge/MovieAgeBadge";
import { QRCodeSVG } from "qrcode.react";
import "./TicketDetails.css";

const TicketDetails = ({ booking, onClose }) => {
  const [seatDetails, setSeatDetails] = useState([]);
  const [refundInfo, setRefundInfo] = useState(null);
  const [movieDetail, setMovieDetail] = useState(null); // Thêm state lưu movie chi tiết

  useEffect(() => {
    // Lấy thông tin hoàn tiền nếu có
    const fetchRefundInfo = async () => {
      if (
        booking?.status !== "REFUND_REQUESTED" &&
        booking?.status !== "CANCELLED"
      )
        return;

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings/refund-bookings/booking/${booking.id}`
        );
        setRefundInfo(res.data[0]);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin hoàn tiền:", err);
      }
    };

    fetchRefundInfo();
  }, [booking]);

  useEffect(() => {
    // Lấy thông tin ghế
    const fetchSeatDetails = async () => {
      if (booking?.seat_ids && booking.seat_ids.length > 0) {
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
      } else {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/bookings/user/${booking.user_id}`
          );
          const allBookings = res.data;

          const matched = allBookings.find((b) => b.id === booking.id);
          if (matched && matched.seat_ids?.length > 0) {
            const seatPromises = matched.seat_ids.map((id) =>
              axios.get(`${process.env.REACT_APP_API_URL}/api/seats/${id}`)
            );
            const seatResponses = await Promise.all(seatPromises);
            const seats = seatResponses.map((res) => res.data);
            setSeatDetails(seats);
          }
        } catch (err) {
          console.error("Lỗi khi lấy danh sách booking của user:", err);
        }
      }
    };

    fetchSeatDetails();
  }, [booking]);

  // --- THÊM useEffect lấy movie detail ---
  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!booking?.movie_id) return;

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/movies/${booking.movie_id}`
        );
        setMovieDetail(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin phim:", err);
      }
    };

    fetchMovieDetail();
  }, [booking?.movie_id]);
  // --- Kết thúc ---

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

  const qrData = String(booking.id);

  const handleConfirmRefund = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/bookings/${booking.id}/status`,
        { status: "CANCELLED" }
      );

      alert("Đã xác nhận hoàn tiền và hủy vé.");
      window.location.reload();
      onClose();
    } catch (err) {
      console.error("Lỗi khi xác nhận hoàn tiền:", err);
      alert("Xác nhận hoàn tiền thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div
        className="ticket-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", gap: "20px" }}
      >
        <div style={{ flex: 1 }}>
          <button className="close-button" onClick={onClose}>
            ×
          </button>

          <div className="ticket-modal-body">
            {/* Poster bên trái */}
            <img
              src={
                movieDetail
                  ? `${process.env.REACT_APP_API_URL}/movies/${movieDetail.poster}`
                  : ""
              }
              alt="Poster"
              className="modal-movie-poster"
            />

            {/* Thông tin bên phải */}
            <div className="ticket-info">
              <h3>{movieDetail ? movieDetail.title : "Đang tải..."}</h3>
              <div className="ticket-movie-age-badge-wrapper">
                <MovieAgeBadge age={movieDetail?.age} />
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
          {(booking.status === "REFUND_REQUESTED" ||
            booking.status === "CANCELLED") &&
            refundInfo && (
              <div
                style={{
                  fontSize: "16px",
                  marginTop: "8px",
                  backgroundColor:
                    booking.status === "REFUND_REQUESTED"
                      ? "#fff3cd"
                      : "#d4edda",
                  padding: "10px",
                  borderRadius: "5px",
                  color:
                    booking.status === "REFUND_REQUESTED"
                      ? "#856404"
                      : "#155724",
                }}
              >
                <strong>
                  {booking.status === "REFUND_REQUESTED"
                    ? "Yêu cầu hoàn tiền đang chờ xử lý"
                    : "Đã hoàn tiền"}
                </strong>
                <p>
                  Số tiền hoàn:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                    .format(refundInfo.amount)
                    .replace("₫", "")}
                  <u>đ</u>
                </p>
                <p>
                  Phương thức nhận tiền:{" "}
                  {refundInfo.method === "momo"
                    ? "Momo"
                    : "Chuyển khoản ngân hàng"}
                </p>

                {refundInfo.method === "momo" ? (
                  <>
                    <p>Số Momo: {refundInfo.phone}</p>
                    <p>Tên tài khoản Momo: {refundInfo.momo_account_name}</p>
                  </>
                ) : (
                  <>
                    <p>Ngân hàng: {refundInfo.bank_name}</p>
                    <p>Số tài khoản: {refundInfo.bank_account_number}</p>
                    <p>Tên chủ tài khoản: {refundInfo.bank_account_name}</p>
                  </>
                )}
              </div>
            )}

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
              {booking.status === "REFUND_REQUESTED" && refundInfo && (
                <button
                  className="refund-confirm-button"
                  onClick={handleConfirmRefund}
                >
                  Xác nhận hoàn tiền
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
