import React from "react";
import "./PaymentMethod.css";

import momoIcon from "../../assets/MoMo_Logo.png";
import shopeePayIcon from "../../assets/Logo-ShopeePay-V.webp";
import zaloPayIcon from "../../assets/Logo-ZaloPay-Square.webp";

const PaymentMethod = ({ selectedMethod, onChange }) => {
  const methods = [
    { label: "Ví MoMo", value: "momo", icon: momoIcon },
    { label: "Shopee Pay", value: "shopee", icon: shopeePayIcon },
    { label: "Zalo Pay", value: "zalo", icon: zaloPayIcon },
  ];

  return (
    <div className="payment-method-container">
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
              />
              <img
                src={method.icon}
                alt={method.label}
                className="payment-icon"
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
