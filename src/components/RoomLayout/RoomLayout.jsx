import React, { useState, useMemo, useEffect } from "react";
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

const RoomLayout = ({ room_id, initialSeats, onClose }) => {
  const [seats, setSeats] = useState(initialSeats || []);
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeatSelection = (seat) => {
    setSelectedSeats((prev) =>
      prev.some((s) => s.seat_number === seat.seat_number)
        ? prev.filter((s) => s.seat_number !== seat.seat_number)
        : [...prev, seat]
    );
  };

  const layout = useMemo(() => createSeatLayout(seats), [seats]); // Tạo sơ đồ ghế từ danh sách ghế

  useEffect(() => {
    if (initialSeats && initialSeats.length > 0) {
      const rows = [...new Set(initialSeats.map((seat) => seat.seat_number[0]))]
        .length;
      const columns = Math.max(
        ...initialSeats.map((seat) => parseInt(seat.seat_number.slice(1)))
      );
      setRows(rows);
      setColumns(columns);
    }
  }, [initialSeats]);
  // Hàm gọi API để tạo ghế
  const handleAddSeats = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/seats/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id,
          rows: rows,
          columns: columns,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Reset lại số hàng và cột về mặc định
        setRows(rows);
        setColumns(columns);

        const seatsRes = await fetch(
          `http://localhost:8080/api/seats/room/${room_id}`
        );
        const seatsData = await seatsRes.json();
        setSeats(seatsData.seats || []);
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error("Có lỗi khi tạo ghế:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVIPSeats = async () => {
    setLoading(true);
    try {
      // Lặp qua tất cả ghế đã chọn và cập nhật type thành 'vip'
      for (const seat of selectedSeats) {
        await fetch(`http://localhost:8080/api/seats/${seat.id}/type`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "vip", // Truyền loại ghế là 'vip'
          }),
        });
      }

      // Cập nhật lại danh sách ghế
      const seatsRes = await fetch(
        `http://localhost:8080/api/seats/room/${room_id}`
      );
      const seatsData = await seatsRes.json();
      setSeats(seatsData.seats || []);

      // Reset selected seats
      setSelectedSeats([]);
    } catch (error) {
      console.error("Có lỗi khi đổi loại ghế:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegularSeats = async () => {
    setLoading(true);
    try {
      // Lặp qua tất cả ghế đã chọn và cập nhật type thành 'regular'
      for (const seat of selectedSeats) {
        await fetch(`http://localhost:8080/api/seats/${seat.id}/type`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "regular",
          }),
        });
      }

      // Cập nhật lại danh sách ghế
      const seatsRes = await fetch(
        `http://localhost:8080/api/seats/room/${room_id}`
      );
      const seatsData = await seatsRes.json();
      setSeats(seatsData.seats || []);

      // Reset selected seats
      setSelectedSeats([]);
    } catch (error) {
      console.error("Có lỗi khi đổi loại ghế:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeats = async () => {
    setLoading(true);
    try {
      // Lặp qua tất cả ghế đã chọn và đổi trạng thái thành 'inactive'
      for (const seat of selectedSeats) {
        await fetch(`http://localhost:8080/api/seats/${seat.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "inactive", // Đổi trạng thái ghế thành inactive
          }),
        });
      }

      // Cập nhật lại danh sách ghế sau khi đổi trạng thái
      const seatsRes = await fetch(
        `http://localhost:8080/api/seats/room/${room_id}`
      );
      const seatsData = await seatsRes.json();
      setSeats(seatsData.seats || []);

      // Reset selected seats
      setSelectedSeats([]);
    } catch (error) {
      console.error("Có lỗi khi thay đổi trạng thái ghế:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-overlay">
      <div className="room-layout-modal">
        {loading ? (
          <div className="loading-message">Đang xử lý, vui lòng đợi...</div>
        ) : (
          <>
            <div className="screen">MÀN HÌNH</div>

            <div className="seats-container">
              {layout.length === 0 ? (
                <div className="no-layout-message">Chưa có sơ đồ ghế</div>
              ) : (
                layout.map((row, rowIndex) => (
                  <div key={rowIndex} className="seat-row">
                    <div className="row-label">
                      {String.fromCharCode(65 + rowIndex)}
                    </div>
                    <div className="seats-wrapper">
                      {row.map((seat, colIndex) => {
                        const isSelected = selectedSeats.some(
                          (s) => s.seat_number === seat?.seat_number
                        );

                        if (seat?.status === "inactive") {
                          return (
                            <div key={colIndex} className="seat empty-seat" />
                          );
                        }
                        return (
                          <div
                            key={colIndex}
                            className={`seat ${seat?.status || "available"} ${
                              seat?.type === "vip" ? "vip" : "regular"
                            } ${isSelected ? "selected" : ""}`}
                            title={seat?.seat_number}
                            onClick={() => seat && toggleSeatSelection(seat)}
                          >
                            {seat?.seat_number}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="seat-info-panel">
          <div className="seat-info-left">
            <p>
              <strong>Trạng thái:</strong>
            </p>
            <ul>
              <li>
                <span className="seat selected"></span> Ghế đang chọn
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
                <span className="seat regular"></span> Ghế thường
              </li>
              <li>
                <span className="seat vip"></span> Ghế VIP
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
            <input
              id="rows"
              type="number"
              min="1"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="cols">Số cột ghế:</label>
            <input
              id="cols"
              type="number"
              min="1"
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
            />
          </div>
        </div>
        <button className="add-seats-button" onClick={handleAddSeats}>
          Tạo ghế
        </button>
        {selectedSeats.length > 0 && (
          <div className="selected-seats-list">
            <h4>Ghế đang chọn ({selectedSeats.length}):</h4>
            <p>{selectedSeats.map((seat) => seat.seat_number).join(", ")}</p>
          </div>
        )}
        <div className="seats-button-group">
          {selectedSeats.length > 0 && (
            <>
              <button className="vip-seats-button" onClick={handleVIPSeats}>
                Ghế VIP
              </button>
              <button
                className="regular-seats-button"
                onClick={handleRegularSeats}
              >
                Ghế thường
              </button>
              <button
                className="delete-seats-button"
                onClick={handleDeleteSeats}
              >
                Xóa ghế
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomLayout;
