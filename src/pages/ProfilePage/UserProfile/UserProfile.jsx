import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../../../redux/actions";
import axios from "axios";
import "./UserProfile.css";
import { FaRegCalendarAlt, FaEye, FaEyeSlash } from "react-icons/fa";

const UserProfile = ({ userId, token }) => {
  const dispatch = useDispatch();
  const hiddenDateRef = useRef();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    points: 0,
  });

  const [rawDate, setRawDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State quản lý form đổi mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { name, email, phone, gender, birthdate, points } = res.data;
        const raw = birthdate?.slice(0, 10) || "";
        const [year, month, day] = raw.split("-");
        const formatted = raw ? `${day}/${month}/${year}` : "";

        setFormData({ name, email, phone, gender, points: points || 0 });
        setRawDate(raw);
        setFormattedDate(formatted);
      } catch (err) {
        setError("Lỗi tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUser();
    }
  }, [userId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setRawDate(date);
    const [year, month, day] = date.split("-");
    if (year && month && day) {
      setFormattedDate(`${day}/${month}/${year}`);
    } else {
      setFormattedDate("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const payload = {
        ...formData,
        birthdate: rawDate,
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(updateUser(res.data.user));
      setMessage("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err.response?.data?.error || "Lỗi khi cập nhật thông tin.");
    }
  };

  // Xử lý thay đổi form mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gửi đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setPasswordLoading(true);
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPasswordMessage("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setShowChangePassword(false);
    } catch (err) {
      setPasswordError(
        err.response?.data?.error || "Lỗi khi đổi mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const toggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) return <p>Đang tải thông tin...</p>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="user-profile-form">
        {passwordMessage && (
          <p className="success-message">{passwordMessage}</p>
        )}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="row">
          <label>
            Họ tên:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="row">
          <label style={{ flex: 1, position: "relative" }}>
            Ngày sinh:
            <input
              type="text"
              value={formattedDate}
              readOnly
              style={{ paddingRight: "40px" }}
            />
            <span
              onMouseDown={() => hiddenDateRef.current?.showPicker?.()}
              style={{
                position: "absolute",
                right: "16px",
                top: "55%",
                cursor: "pointer",
                color: "#888",
              }}
            >
              <FaRegCalendarAlt />
            </span>
            <input
              type="date"
              ref={hiddenDateRef}
              value={rawDate}
              onChange={handleDateChange}
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
              }}
            />
          </label>

          <label>
            Số điện thoại:
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="row">
          <label>
            Giới tính:
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </label>

          <label>
            Điểm tích lũy:
            <input
              type="number"
              name="points"
              value={formData.points}
              readOnly
            />
          </label>
        </div>

        <div className="button-row">
          <div>
            {!showChangePassword && (
              <button
                onClick={() => setShowChangePassword(true)}
                style={{
                  width: "100%",
                  padding: "12px 30px",
                  fontSize: "16px",
                  backgroundColor: "#0c47be",
                  border: "none",
                  color: "white",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  marginTop: "10px",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#02369d")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#0c47be")
                }
              >
                Đổi mật khẩu
              </button>
            )}
          </div>
          <button type="submit">Cập nhật</button>
        </div>
      </form>

      {/* Nút bật form đổi mật khẩu */}

      {showChangePassword && (
        <div
          className="change-password-overlay"
          onClick={(e) => {
            // Nếu click vào vùng overlay (ngoài popup), đóng popup
            if (e.target.classList.contains("change-password-overlay")) {
              setShowChangePassword(false);
              setShowOldPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
              setPasswordError("");
              setPasswordMessage("");
              setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: "",
              });
            }
          }}
        >
          <form
            onSubmit={handlePasswordSubmit}
            className="change-password-form-overlay"
            onClick={(e) => e.stopPropagation()} // Ngăn không cho click form nổi lên đóng popup
          >
            <h3>Đổi mật khẩu</h3>

            {passwordError && <p className="error-message">{passwordError}</p>}

            <label>
              Mật khẩu cũ:
              <div style={{ position: "relative" }}>
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ width: "93%" }}
                />
                <span
                  onClick={toggleOldPassword}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "60%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#888",
                  }}
                >
                  {showOldPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </label>

            <label>
              Mật khẩu mới:
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ width: "93%" }}
                />
                <span
                  onClick={toggleNewPassword}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "60%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#888",
                  }}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </label>

            <label>
              Xác nhận mật khẩu mới:
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{ width: "93%" }}
                />
                <span
                  onClick={toggleConfirmPassword}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "60%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#888",
                  }}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
            </label>

            <div className="button-row">
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setShowOldPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  setPasswordError("");
                  setPasswordMessage("");
                  setPasswordData({
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                  });
                }}
              >
                Hủy
              </button>
              <button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
