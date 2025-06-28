import React, { useState } from "react";
import "./UpdatePriceModal.css";

const formatNumber = (value) => {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (value) => {
  return value.replace(/,/g, "");
};

const UpdatePriceModal = ({ onClose, onSubmit }) => {
  const [priceRegular, setPriceRegular] = useState("");
  const [priceVIP, setPriceVIP] = useState("");

  const handleSubmit = () => {
    onSubmit({
      priceRegular: priceRegular ? parseFloat(parseNumber(priceRegular)) : null,
      priceVIP: priceVIP ? parseFloat(parseNumber(priceVIP)) : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="update-price-container"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="update-price-close-btn" onClick={onClose}>
          &times;
        </span>
        <h3>Cập nhật giá vé</h3>
        <div className="update-price-form">
          <div className="form-group">
            <label>Giá ghế thường:</label>
            <input
              type="text"
              value={formatNumber(priceRegular)}
              onChange={(e) => {
                const raw = parseNumber(e.target.value);
                if (/^\d*$/.test(raw)) setPriceRegular(raw);
              }}
            />
          </div>
          <div className="form-group">
            <label>Giá ghế VIP:</label>
            <input
              type="text"
              value={formatNumber(priceVIP)}
              onChange={(e) => {
                const raw = parseNumber(e.target.value);
                if (/^\d*$/.test(raw)) setPriceVIP(raw);
              }}
            />
          </div>
          <div className="update-price-actions">
            <button onClick={handleSubmit}>Cập nhật</button>
            <button onClick={onClose}>Huỷ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePriceModal;
