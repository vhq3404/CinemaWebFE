import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDetail from "../../components/BookingDetail/BookingDetail";
import RoomLayout from "../../components/RoomLayout/RoomLayout";
import "./BookingPage.css";

const BookingPage = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { showtime } = location.state || {};
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://localhost:8080/api/seats/room/${showtime.room.roomId}`
        );
        const data = await res.json();
        console.log("room", showtime.room.roomId);
        console.log("seats", data.seats);
        setSeats(data.seats || []); // Lấy đúng mảng seats
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ghế:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (showtime?.room?.roomId) {
      fetchSeats();
    }
  }, [showtime]);

  if (!showtime) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Không có thông tin suất chiếu</h2>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      <div className="booking-main">
        {isLoading ? (
          <div className="loading-indicator">Đang tải sơ đồ ghế...</div>
        ) : (
          <RoomLayout
            room_id={showtime.room.roomId}
            initialSeats={seats}
            onSelectedSeatsChange={setSelectedSeats}
            onClose={() => {}}
            isOverlay={false}
          />
        )}
      </div>
      <div>
        <div className="booking-detail-sidebar">
          <BookingDetail showtime={showtime} selectedSeats={selectedSeats} />
        </div>
        {selectedSeats.length > 0 && (
          <div className="booking-confirm-wrapper">
            <button
              className="booking-confirm-button"
              onClick={() => {
                console.log("Xác nhận ghế:", selectedSeats);
                alert("Xác nhận đặt vé thành công!");
              }}
            >
              Xác nhận
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default BookingPage;
