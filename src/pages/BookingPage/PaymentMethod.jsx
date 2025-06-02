import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./PaymentMethod.css";

import vietQRIcon from "../../assets/434x0w.webp";

const STORAGE_KEY = "appliedPoints";

const PaymentMethod = ({
  selectedMethod,
  onChange,
  onAppliedPointsChange,
  actualAppliedPoints,
  appliedPoints: appliedPointsProp,
}) => {
  const [points, setPoints] = useState("");
  const [appliedPoints, setAppliedPoints] = useState(null);
  const userPoints = useSelector((state) => state.user.points || 0);

  const methods = [
    { label: "QR thanh toán", value: "payos", icon: vietQRIcon },
  ];

  // Khi component mount, đọc appliedPoints từ localStorage để đồng bộ trạng thái
  useEffect(() => {
    const savedPoints = localStorage.getItem(STORAGE_KEY);
    if (savedPoints) {
      const parsedPoints = parseInt(savedPoints, 10);
      if (!isNaN(parsedPoints) && parsedPoints > 0) {
        setAppliedPoints(parsedPoints);
        setPoints(parsedPoints);
        onAppliedPointsChange(parsedPoints);
      }
    }
  }, [onAppliedPointsChange]);

  // Đồng bộ points với actualAppliedPoints từ props
  useEffect(() => {
    if (appliedPoints !== null) {
      setPoints(actualAppliedPoints);
      // Lưu actualAppliedPoints vào localStorage mỗi khi thay đổi
      localStorage.setItem(STORAGE_KEY, actualAppliedPoints);
    } else {
      // Nếu không áp dụng điểm thì xóa localStorage
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [actualAppliedPoints, appliedPoints]);

  useEffect(() => {
    // Khi prop appliedPoints từ BookingPage thay đổi → cập nhật lại state
    if (appliedPointsProp === 0) {
      setAppliedPoints(null);
      setPoints("");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [appliedPointsProp]);

  const handleApplyPoints = () => {
    const value = parseInt(points);
    if (isNaN(value) || value <= 0) {
      alert("Vui lòng nhập số điểm hợp lệ!");
      return;
    }
    if (value > userPoints) {
      alert(`Bạn chỉ có tối đa ${userPoints} điểm.`);
      return;
    }
    setAppliedPoints(value);
    onAppliedPointsChange(value);
    // actualAppliedPoints sẽ cập nhật sau khi onAppliedPointsChange được gọi
  };

  const handleCancelPoints = () => {
    setAppliedPoints(null);
    setPoints("");
    onAppliedPointsChange(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="payment-method-container">
      {/* Khung áp dụng điểm */}
      <div className="point-apply-box">
        <h3>Áp dụng điểm tích lũy</h3>
        <p className="available-point-info">
          Bạn đang có <strong>{userPoints}</strong> điểm
        </p>
        <div className="point-input-group">
          <input
            type="number"
            placeholder="Nhập số điểm"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="point-input"
            min="0"
            disabled={appliedPoints !== null}
          />
          {appliedPoints === null ? (
            <button onClick={handleApplyPoints} className="apply-point-button">
              Áp dụng
            </button>
          ) : (
            <button
              onClick={handleCancelPoints}
              className="cancel-point-button"
            >
              Hủy
            </button>
          )}
        </div>
        {appliedPoints !== null && (
          <p className="applied-point-info">
            Đã áp dụng: <strong>{actualAppliedPoints}</strong> điểm
          </p>
        )}
        <div className="point-note">
          <strong>Lưu ý:</strong>
          <ul>
            <li>Mỗi điểm tương đương 1.000đ giảm giá.</li>
            <li>
              Số tiền thanh toán sau khi áp dụng điểm không được thấp hơn
              10.000đ. 5% trên tổng giá trị/ số tiền giao dịch
            </li>
            <li>
              Số điểm nhận được sẽ tương đương 5% trên tổng giá trị/ số tiền
              giao dịch. Ví dụ hóa đơn giao dịch của khách hàng là 100.000 VNĐ.
              Số điểm tích được sẽ là 5, tương đương với 5.000 VNĐ.
            </li>
          </ul>
        </div>
      </div>

      {/* Khung chọn phương thức thanh toán */}
      <h3>Chọn phương thức thanh toán</h3>
      <ul className="payment-method-list">
        {methods.map((method) => (
          <li key={method.value}>
            <label
              className={`payment-method-item ${
                selectedMethod === method.value ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.value}
                checked={selectedMethod === method.value}
                onChange={onChange}
                disabled={appliedPoints !== null}
              />

              {method.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentMethod;
