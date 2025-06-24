import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/actions";
import TicketPrint from "../../components/TicketDetails/TicketPrint";
import "./PaymentSuccessPage.css";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [bookingDetails, setBookingDetails] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const hasConfirmedRef = useRef(false);

  useEffect(() => {
    const confirmPayment = async () => {
      if (hasConfirmedRef.current) return;
      hasConfirmedRef.current = true;

      const bookingId = localStorage.getItem("bookingId");
      const foodBookingId = localStorage.getItem("foodBookingId");
      const usedPoints = Number(localStorage.getItem("appliedPoints") || 0);

      if (!bookingId || !user?.id) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/payments/success`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId,
              foodBookingId,
              userId: user.id,
              usedPoints,
            }),
          }
        );

        if (response.ok) {
          localStorage.removeItem("appliedPoints");

          // Cập nhật điểm mới của user
          const userResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/api/users/${user.id}`
          );
          if (userResponse.ok) {
            const updatedUser = await userResponse.json();
            dispatch(updateUser(updatedUser));
          }

          // Lấy chi tiết booking
          const bookingRes = await fetch(
            `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`
          );
          const booking = await bookingRes.json();

          // Lấy chi tiết showtime
          const showtimeRes = await fetch(
            `${process.env.REACT_APP_API_URL}/api/showtimes/${booking.showtime_id}`
          );
          const showtime = (await showtimeRes.json()).showtime;

          // Lấy chi tiết movie
          const movieRes = await fetch(
            `${process.env.REACT_APP_API_URL}/api/movies/${booking.movie_id}`
          );
          const movie = await movieRes.json();

          // Gộp tất cả vào bookingDetails
          setBookingDetails({ ...booking, showtime, movie });
          localStorage.setItem(
            "bookingDetails",
            JSON.stringify({ ...booking, showtime, movie })
          );

          // Xóa localStorage không cần nữa
          //localStorage.removeItem("bookingId");
          //localStorage.removeItem("foodBookingId");
        } else {
          console.error("Xác nhận thanh toán thất bại.");
        }
      } catch (error) {
        console.error("Lỗi khi xác nhận thanh toán:", error);
      }
    };

    if (user?.id) {
      confirmPayment();
    }
    return () => {
      localStorage.removeItem("bookingId");
      localStorage.removeItem("bookingDetails");
    };
  }, [user?.id, dispatch]);

  return (
    <div>
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

          {user?.role === "employee" && (
            <button
              className="view-ticket-button"
              onClick={() => setShowTicketModal(true)}
            >
              In vé
            </button>
          )}
        </div>
      </div>
      {showTicketModal && (
        <TicketPrint
          booking={bookingDetails}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
};

export default PaymentSuccessPage;
