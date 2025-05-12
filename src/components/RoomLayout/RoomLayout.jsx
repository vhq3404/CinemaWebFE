import React from "react";
import "./RoomLayout.css";

// Hàm để tạo sơ đồ ghế
const createSeatLayout = (seats) => {
  const layout = {};

  seats.forEach((seat) => {
    const rowLabel = seat.seat_number[0];
    if (!layout[rowLabel]) layout[rowLabel] = [];

    const colNumber = parseInt(seat.seat_number.slice(1));
    layout[rowLabel][colNumber - 1] = seat;
  });

  return Object.keys(layout)
    .sort()
    .map((row) => layout[row]);
};

const RoomLayout = ({ seats, onClose }) => {
  const layout = createSeatLayout(seats);

  return (
    <div className="room-overlay">
      <div className="room-layout-modal">
        <div className="screen">MÀN HÌNH</div>

        <div className="seats-container">
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              <div className="row-label">
                {String.fromCharCode(65 + rowIndex)}
              </div>
              <div className="seats-wrapper">
                {row.map((seat, colIndex) => (
                  <div
                    key={colIndex}
                    className={`seat ${seat?.status || "available"}`}
                    title={seat?.seat_number}
                  >
                    {seat?.seat_number}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="seat-info-panel">
          <div className="seat-info-left">
            <p>
              <strong>Trạng thái:</strong>
            </p>
            <ul>
              <li>
                <span className="seat selected"></span> Ghế đã chọn
              </li>
              <li>
                <span className="seat booked"></span> Ghế đã đặt
              </li>
            </ul>
          </div>

          <div className="seat-info-right">
            <p>
              <strong>Loại ghế:</strong>
            </p>
            <ul>
              <li>
                <span className="seat type-regular"></span> Ghế thường
              </li>
              <li>
                <span className="seat type-vip"></span> Ghế VIP
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Thêm bảng điều chỉnh mới nằm bên phải */}
      <div className="adjustment-panel">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h3>Chỉnh sửa sơ đồ</h3>
        <div className="adjustment-controls">
          <div>
            <label htmlFor="rows">Số hàng ghế:</label>
            <input id="rows" type="number" min="1" defaultValue="10" />
          </div>
          <div>
            <label htmlFor="cols">Số cột ghế:</label>
            <input id="cols" type="number" min="1" defaultValue="12" />
          </div>
        </div>
          <button className="add-seats-button">Thêm ghế</button>
      </div>
    </div>
  );
};

export default RoomLayout;
