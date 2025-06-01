import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetail from "../../components/BookingDetail/BookingDetail";
import RoomLayout from "../../components/RoomLayout/RoomLayout";
import "./BookingPage.css";
import PaymentMethod from "./PaymentMethod";
import { MdOutlineAccessTime } from "react-icons/md";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL;

const BookingPage = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [actualAppliedPoints, setActualAppliedPoints] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { showtime } = location.state || {};

  const [bookingId, setBookingId] = useState(null);
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);

  const handlePayOSPayment = async () => {
    if (!bookingId) {
      alert("Không tìm thấy mã đặt vé");
      return;
    }

    const paymentCode = `PMT-${bookingId}-${Date.now()}`;

    try {
      const updateRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}/total_price`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total_price: totalPrice }),
        }
      );

      if (!updateRes.ok) {
        throw new Error("Không thể cập nhật giá booking");
      }

      const response = await fetch(
        `${process.env.REACT_APP_QR_URL}/api/payments/payos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalPrice,
            paymentCode,
          }),
        }
      );

      if (!response.ok) {
        alert("Không thể tạo link thanh toán");
        return;
      }

      const result = await response.json();
      localStorage.setItem("bookingId", bookingId);
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      alert("Có lỗi xảy ra khi thanh toán: " + error.message);
    }
  };

  const handleCancelBooking = useCallback(async () => {
    if (!bookingId) return;

    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      setBookingId(null);
      setSelectedSeats([]);
      navigate("/");
    } catch (err) {
      console.error("Lỗi khi hủy booking:", err);
      alert("Không thể hủy booking. Vui lòng thử lại.");
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          alert("Hết thời gian giữ ghế. Giao dịch đã bị hủy.");
          clearInterval(timerId);
          handleCancelBooking(); // an toàn vì đã được ổn định
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [countdown, handleCancelBooking]);

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

  const handleAppliedPointsChange = (points) => {
    setAppliedPoints(points);
  };

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
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!response.ok) {
        throw new Error("Tạo booking thất bại");
      }

      const result = await response.json();
      setBookingId(result.booking_id);

      setCurrentStep(2);
      setCountdown(600);
      setPaymentMethod("payos");
    } catch (error) {
      alert("Đã xảy ra lỗi khi đặt vé: " + error.message);
    }
  };

  // Xử lý xóa booking khi ấn "Quay lại"
  const handleBackToSeatSelection = async () => {
    if (bookingId) {
      try {
        await fetch(
          `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`,
          {
            method: "DELETE",
          }
        );
        setBookingId(null);
      } catch (error) {
        console.error("Xóa booking thất bại:", error);
      }
    }
    setAppliedPoints(0);
    setActualAppliedPoints(0);
    setTotalPrice(0);
    setCurrentStep(1);
  };

  const handleSelectedSeatsChange = (newSelectedSeats) => {
    setSelectedSeats(newSelectedSeats);

    if (socketRef.current && showtime?._id) {
      socketRef.current.emit("lockSeats", {
        showtimeId: showtime._id,
        seatIds: newSelectedSeats.map((seat) => seat.id),
        userId: user.id,
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
          ) : currentStep === 2 ? (
            <PaymentMethod
              selectedMethod={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              onAppliedPointsChange={handleAppliedPointsChange}
              actualAppliedPoints={actualAppliedPoints}
            />
          ) : null}
        </div>

        <div>
          {(currentStep === 2 || currentStep === 3) && (
            <div className="countdown-timer">
              <MdOutlineAccessTime />
              Thời gian giữ ghế còn:{" "}
              {Math.floor(countdown / 60)
                .toString()
                .padStart(2, "0")}
              :{(countdown % 60).toString().padStart(2, "0")}
            </div>
          )}

          <div className="booking-detail-sidebar">
            <BookingDetail
              showtime={showtime}
              selectedSeats={selectedSeats}
              onTotalPriceChange={setTotalPrice}
              appliedPoints={appliedPoints}
              onActualAppliedPointsChange={setActualAppliedPoints}
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
                onClick={handlePayOSPayment}
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
