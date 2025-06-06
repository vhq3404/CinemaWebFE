import React, { useState, useEffect } from "react";
import "./LoginComponent.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import { login } from "../../redux/actions";
import { toast } from "sonner";

const LoginComponent = ({
  onClose,
  onSwitchToSignup,
  showtime,
  navigateAfterLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const dispatch = useDispatch();
  useEffect(() => {
    if (countdown === 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Login bình thường (giữ nguyên)
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Đăng nhập thất bại");
        setIsLoading(false);
        return;
      }

      dispatch(login(data.user, data.token));
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (showtime && navigateAfterLogin) {
        navigateAfterLogin("/booking", { state: { showtime } });
      }
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      setErrorMessage("Lỗi kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi OTP thật qua API
  const handleSendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!email) {
      setErrorMessage("Vui lòng nhập email trước khi nhận OTP");
      return;
    }
    setIsSendingOtp(true);
    setCountdown(300);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/forgot-password/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Gửi OTP thất bại");
      } else {
        setSuccessMessage("OTP đã được gửi đến email của bạn.");
        setOtpSent(true);
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối đến server khi gửi OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Xác minh OTP thật qua API
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otp) {
      setErrorMessage("Vui lòng nhập mã OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Xác thực OTP thất bại");
      } else {
        setIsResettingPassword(true); // Chuyển sang bước đặt lại mật khẩu mới
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối đến server khi xác minh OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi mật khẩu mới qua API
  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/forgot-password/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Đặt lại mật khẩu thất bại");
      } else {
        toast.success(
          "Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại"
        );
        setIsResettingPassword(false);
        setIsForgotPassword(false);
        setOtp("");
        setEmail("");
        setSuccessMessage("");
        setErrorMessage("");
        setPassword("");
        setNewPassword("");
        setOtpSent(false);
        setCountdown(0);
        setConfirmPassword("");
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối đến server khi đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-form">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        {isResettingPassword ? (
          <>
            <h2>Đặt lại mật khẩu</h2>
            <form onSubmit={handleSubmitNewPassword}>
              <div>
                <label>
                  <MdLockOutline />
                  Mật khẩu mới:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>
                  <MdLockOutline />
                  Xác nhận mật khẩu mới:
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {errorMessage && (
                <div className="error-message" style={{ marginTop: "8px" }}>
                  {errorMessage}
                </div>
              )}

              <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="signup-button"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setIsForgotPassword(true);
                    setNewPassword("");
                  }}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="send-email-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang lưu..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </>
        ) : isForgotPassword ? (
          <>
            <h2>Quên mật khẩu</h2>
            <form onSubmit={handleResetPassword}>
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "12px",
                }}
              >
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  style={{ flex: 1, minWidth: "120px" }}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  style={{
                    whiteSpace: "nowrap",
                    width: "30%",
                    marginBottom: "10px",
                  }}
                >
                  {isSendingOtp
                    ? "Đang gửi..."
                    : otpSent
                    ? "Gửi lại OTP"
                    : "Nhận OTP"}
                </button>
              </div>

              {errorMessage && (
                <div className="error-message" style={{ marginTop: "8px" }}>
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div
                  className="success-message"
                  style={{ marginTop: "8px", color: "green" }}
                >
                  {successMessage}
                  {countdown > 0 && (
                    <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                      ({Math.floor(countdown / 60)}:
                      {String(countdown % 60).padStart(2, "0")})
                    </span>
                  )}
                </div>
              )}

              <div
                className="forgot-password-buttons"
                style={{ marginTop: "16px", display: "flex", gap: "12px" }}
              >
                <button
                  type="button"
                  className="signup-button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setPassword("");
                  }}
                >
                  Quay lại đăng nhập
                </button>
                <button
                  type="submit"
                  className="send-email-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>Đăng nhập</h2>
            <form onSubmit={handleLogin}>
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
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => setIsForgotPassword(true)}
              >
                Quên mật khẩu?
              </button>

              <div className="login-divider"></div>
              <div className="register-suggestion">Bạn chưa có tài khoản?</div>
              <button
                type="button"
                className="signup-button"
                onClick={onSwitchToSignup}
              >
                Đăng ký
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;
