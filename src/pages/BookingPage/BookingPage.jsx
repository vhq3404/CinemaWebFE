import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetail from "../../components/BookingDetail/BookingDetail";
import RoomLayout from "../../components/RoomLayout/RoomLayout";
import "./BookingPage.css";
import PaymentMethod from "./PaymentMethod";
import { MdOutlineAccessTime } from "react-icons/md";
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
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { showtime } = location.state || {};
  const [bookingId, setBookingId] = useState(null);
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;

    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          alert("Hết thời gian giữ ghế. Giao dịch đã bị hủy.");
          clearInterval(timerId);
          handleCancelBooking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [countdown]);

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
      setPaymentMethod("vietQR");
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
    setCurrentStep(1);
  };

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
      // Tạo paymentCode (backend có thể tự tạo, nhưng bạn vẫn tạo frontend để gửi)
      const paymentCode = `PMT-${bookingId}-${Date.now()}`;
      const movieTitle = showtime?.movie?.title;

      // Gửi request tạo mã QR (chỉ lấy QR, không lưu payment)
      const response = await fetch(
        `${process.env.REACT_APP_QR_URL}/api/payments/qr`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentCode,
            paymentMethod,
            movieTitle,
            totalPrice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Tạo mã QR thất bại");
      }

      const data = await response.json();

      // Lưu URL mã QR để hiển thị
      setQrCodeUrl(data.data.qrCodeUrl);

      // Ví dụ cập nhật bước xử lý
      setCurrentStep(3);
    } catch (error) {
      alert("Đã xảy ra lỗi khi tạo mã QR: " + error.message);
    }
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

  const handleCancelBooking = async () => {
    if (!bookingId) return;

    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      setBookingId(null);
      setQrCodeUrl(null);
      setSelectedSeats([]);

      navigate("/");
    } catch (err) {
      console.error("Lỗi khi hủy booking:", err);
      alert("Không thể hủy booking. Vui lòng thử lại.");
    }
  };

  const handleManualCancel = () => {
    const confirmCancel = window.confirm("Bạn có chắc muốn hủy giao dịch?");
    if (!confirmCancel) return;
    handleCancelBooking();
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
            />
          ) : currentStep === 3 && qrCodeUrl ? (
            <div className="qr-code-container">
              <h3>Quét mã QR để thanh toán</h3>
              <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
              <button
                className="booking-cancel-button"
                onClick={handleManualCancel}
              >
                Hủy giao dịch
              </button>
            </div>
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
