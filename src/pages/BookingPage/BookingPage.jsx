import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetail from "../../components/BookingDetail/BookingDetail";
import RoomLayout from "../../components/RoomLayout/RoomLayout";
import "./BookingPage.css";
import PaymentMethod from "./PaymentMethod";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL;
console.log("SOCKET_SERVER_URL:", SOCKET_SERVER_URL);
const BookingPage = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { showtime } = location.state || {};
  const [bookingId, setBookingId] = useState(null);
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!showtime?._id) return;

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on("seatsLocked", (data) => {
      if (data.showtimeId === showtime._id) {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            data.seatIds.includes(seat.id) ? { ...seat, isBooked: true } : seat
          )
        );
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [showtime._id]);

  useEffect(() => {
  if (!showtime?.room?.roomId || !showtime?._id) return;

  const fetchSeats = async () => {
    try {
      setIsLoading(true);

      const seatRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/seats/room/${showtime.room.roomId}`
      );
      const seatData = await seatRes.json();
      const allSeats = seatData.seats || [];

      const lockedRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/locked-seats/${showtime._id}`
      );
      const lockedData = await lockedRes.json();
      const lockedSeatIds = new Set(lockedData.locked_seat_ids);

      const processedSeats = allSeats.map((seat) => ({
        ...seat,
        isBooked: lockedSeatIds.has(seat.id),
      }));

      setSeats(processedSeats);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ghế:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchSeats();
}, [showtime._id, showtime.room.roomId]);


  if (!showtime) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Không có thông tin suất chiếu</h2>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  const StepBar = ({ currentStep }) => {
    const steps = ["Chọn ghế", "Chọn Phương thức thanh toán", "Thanh toán"];
    return (
      <div className="step-bar">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={step}
              className={`step-item ${
                isActive ? "active" : isCompleted ? "completed" : ""
              }`}
            >
              <div className="step-number">{stepNumber}</div>
              <div className="step-label">{step}</div>
              {stepNumber !== steps.length && (
                <div className="step-separator" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Xử lý tạo booking PENDING khi bấm "Xác nhận"
  const handleConfirmSeats = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ghế!");
      return;
    }

    const bookingData = {
      user_id: user.id,
      showtime_id: showtime._id,
      room_id: showtime.room.roomId,
      seat_ids: selectedSeats.map((seat) => seat.id),
      total_price: totalPrice,
      status: "PENDING",
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Tạo booking thất bại");
      }

      const result = await response.json();
      setBookingId(result.booking_id);

      setCurrentStep(2);
    } catch (error) {
      alert("Đã xảy ra lỗi khi đặt vé: " + error.message);
    }
  };

  // Xử lý xóa booking khi ấn "Quay lại"
  const handleBackToSeatSelection = async () => {
    if (bookingId) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`, {
          method: "DELETE",
        });
        setBookingId(null);
      } catch (error) {
        console.error("Xóa booking thất bại:", error);
      }
    }
    setCurrentStep(1);
  };

  // Xử lý cập nhật booking thành PAID khi ấn "Thanh toán"
  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    if (!bookingId) {
      alert("Không tìm thấy booking để thanh toán.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "PAID" }),
        }
      );

      if (!response.ok) {
        throw new Error("Thanh toán thất bại");
      }

      const result = await response.json();
      alert("Thanh toán thành công!");
      setCurrentStep(3);
    } catch (error) {
      alert("Đã xảy ra lỗi khi thanh toán: " + error.message);
    }
  };

  const handleSelectedSeatsChange = (newSelectedSeats) => {
    setSelectedSeats(newSelectedSeats);

    if (socketRef.current && showtime?._id) {
      socketRef.current.emit("lockSeats", {
        showtimeId: showtime._id,
        seatIds: newSelectedSeats.map((seat) => seat.id),
        userId: user.id, // nên gửi thêm user ID để server xử lý timeout hoặc unlock đúng người
      });
    }
  };

  return (
    <div>
      <StepBar currentStep={currentStep} />
      <div className="booking-page-container">
        <div className="booking-main">
          {isLoading ? (
            <div className="loading-indicator">Đang tải...</div>
          ) : currentStep === 1 ? (
            <RoomLayout
              room_id={showtime.room.roomId}
              initialSeats={seats}
              onSelectedSeatsChange={handleSelectedSeatsChange}
              onClose={() => {}}
              isOverlay={false}
            />
          ) : (
            <PaymentMethod
              selectedMethod={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          )}
        </div>
        <div>
          <div className="booking-detail-sidebar">
            <BookingDetail
              showtime={showtime}
              selectedSeats={selectedSeats}
              onTotalPriceChange={setTotalPrice}
            />
          </div>
          {currentStep === 1 && selectedSeats.length > 0 && (
            <div className="booking-confirm-wrapper">
              <button
                className="booking-confirm-button"
                onClick={handleConfirmSeats}
              >
                Xác nhận
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div
              className="booking-confirm-wrapper"
              style={{ justifyContent: "space-between" }}
            >
              <button
                className="booking-confirm-button"
                style={{ backgroundColor: "#ccc", color: "#333", width: "48%" }}
                onClick={handleBackToSeatSelection}
              >
                Quay lại
              </button>
              <button
                className="booking-confirm-button"
                style={{ width: "48%" }}
                onClick={handlePayment}
              >
                Thanh toán
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
