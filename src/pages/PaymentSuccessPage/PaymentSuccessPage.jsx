import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/actions"; // sửa path cho đúng dự án của bạn
import "./PaymentSuccessPage.css";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const hasConfirmedRef = useRef(false); 

  useEffect(() => {
    const confirmPayment = async () => {
      if (hasConfirmedRef.current) return;
      hasConfirmedRef.current = true; 

      const bookingId = localStorage.getItem("bookingId");
      const usedPoints = Number(localStorage.getItem("appliedPoints") || 0);

      if (!bookingId || !user?.id) return;

      try {
        const response = await fetch( `${process.env.REACT_APP_API_URL}/api/payments/success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            userId: user.id,
            usedPoints,
          }),
        });

        if (response.ok) {
          localStorage.removeItem("bookingId");
          localStorage.removeItem("appliedPoints");

          const userResponse = await fetch( `${process.env.REACT_APP_API_URL}/api/users/${user.id}`);
          if (userResponse.ok) {
            const updatedUser = await userResponse.json();
            dispatch(updateUser(updatedUser));
          }
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
  }, [user?.id, dispatch]);

  return (
    <div className="payment-success-container">
      <FaCheckCircle className="success-icon" />
      <h1>Thanh toán thành công!</h1>
      <p>Chúc bạn xem phim vui vẻ!</p>

      <div className="success-buttons">
        <button className="back-home-button" onClick={() => navigate("/")}>
          Về trang chủ
        </button>
        <button className="view-ticket-button" onClick={() => navigate("/profile/ticket")}>
          Xem thông tin vé
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
