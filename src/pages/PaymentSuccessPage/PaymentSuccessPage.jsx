import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./PaymentSuccessPage.css";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateBookingStatus = async () => {
      const bookingId = localStorage.getItem("bookingId");

      const queryParams = new URLSearchParams(location.search);
      const status = queryParams.get("status");

      if (status === "PAID" && bookingId) {
        try {
          await fetch(
            `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "PAID" }),
            }
          );

          localStorage.removeItem("bookingId"); // xóa sau khi cập nhật xong
        } catch (err) {
          console.error("Lỗi khi cập nhật trạng thái booking:", err);
        }
      }
    };

    updateBookingStatus();
  }, [location.search]);

  return (
    <div className="payment-success-container">
      <FaCheckCircle className="success-icon" />
      <h1>Thanh toán thành công!</h1>
      <p>Chúc bạn xem phim vui vẻ!</p>

      <div className="success-buttons">
        <button className="back-home-button" onClick={() => navigate("/")}>
          Về trang chủ
        </button>
        <button
          className="view-ticket-button"
          onClick={() => navigate("/profile/ticket")}
        >
          Xem thông tin vé
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
