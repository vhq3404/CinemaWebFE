import React, { useState, useRef } from "react";
import "./SignupComponent.css";
import {
  FaRegCalendar,
  FaRegCalendarAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { GoPerson } from "react-icons/go";
import { MdOutlineEmail, MdLockOutline, MdOutlineLocalPhone } from "react-icons/md";

const SignupComponent = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [rawDate, setRawDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState("");
  const hiddenDateRef = useRef();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu và mật khẩu xác nhận không khớp!");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          gender,
          birthdate: rawDate,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setErrorMessage(data.error || "Đăng ký thất bại.");
        return;
      }
      setErrorMessage("");
      setSuccessMessage("Đăng ký thành công! Vui lòng đăng nhập.");

      setTimeout(() => {
        setSuccessMessage("");
        onSwitchToLogin();
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu đăng ký:", error);
      setErrorMessage("Không thể kết nối tới máy chủ.");
    }
  };  

  const handleDateChange = (e) => {
    const date = e.target.value;
    setRawDate(date);
    const [year, month, day] = date.split("-");
    if (year && month && day) {
      setFormattedDate(`${day}/${month}/${year}`);
    }
  };

  const openDatePicker = () => {
    hiddenDateRef.current.showPicker?.();
  };

  return (
    <div className="signup-overlay">
      <div className="signup-form">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              <GoPerson />
              Họ và tên:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>
              <MdOutlineEmail />
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>
              <MdOutlineLocalPhone  />
              Số điện thoại:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="gender-row">
            <label className="gender-label">Giới tính:</label>
            <div className="gender-options">
              <div className="radio-btn">
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={gender === "Nam"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <label className="radio-label">Nam</label>
              </div>
              <div className="radio-btn">
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={gender === "Nữ"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <label className="radio-label">Nữ</label>
              </div>
            </div>
          </div>
          <div>
            <label>
              <FaRegCalendar />
              Ngày sinh:
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={formattedDate}
                readOnly
                onClick={openDatePicker}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <span
                onClick={openDatePicker}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                <FaRegCalendarAlt />
              </span>
            </div>

            <input
              type="date"
              ref={hiddenDateRef}
              value={rawDate}
              onChange={handleDateChange}
              style={{
                opacity: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
            />
          </div>

          <div>
            <label>
              <MdLockOutline />
              Mật khẩu:
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />
              <span
                onClick={togglePassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <div>
            <label>
              <MdLockOutline />
              Nhập lại mật khẩu:
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }}
              />
              <span
                onClick={toggleConfirmPassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="signup-btn">
            Đăng ký
          </button>

          <div className="signup-divider"></div>
          <div className="login-suggestion">Bạn đã có tài khoản?</div>
          <button
            type="button"
            className="login-btn"
            onClick={onSwitchToLogin}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupComponent;
