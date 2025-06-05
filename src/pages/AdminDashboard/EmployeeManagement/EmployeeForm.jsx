import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "./EmployeeForm.css";

const EmployeeForm = ({ editingEmployee, onClose, onSuccess }) => {
  const [theaters, setTheaters] = useState([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [workplace, setWorkplace] = useState(editingEmployee?.workplace || "");
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/api/theaters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy danh sách rạp");
        return res.json();
      })
      .then((data) => setTheaters(data))
      .catch((err) => {
        console.error(err);
        setTheaters([]);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    if (!editingEmployee) {
      body.password = password;
    }

    const method = editingEmployee ? "PUT" : "POST";
    const url = editingEmployee
      ? `${process.env.REACT_APP_API_URL}/api/employees/${editingEmployee.id}`
      : `${process.env.REACT_APP_API_URL}/api/employees`;
    const token = localStorage.getItem("token");

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...body, role: "employee", workplace }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Thao tác thất bại");
        onSuccess();
      })
      .catch((err) => alert(err.message));
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Lấy ngày theo local, tránh lệch timezone
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // tháng từ 0-11 nên +1
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Hàm tạo mật khẩu ngẫu nhiên 10 ký tự
  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return (
    <div className="employee-overlay" onClick={handleOverlayClick}>
      <div className="employee-overlay-content" onClick={handleContentClick}>
        <h3>{editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}</h3>
        <form className="employee-form" onSubmit={handleSubmit}>
          <label>
            Họ tên
            <input
              name="name"
              placeholder="Họ tên"
              defaultValue={editingEmployee?.name || ""}
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="Email"
              defaultValue={editingEmployee?.email || ""}
              required
            />
          </label>

          <label>
            Số điện thoại
            <input
              name="phone"
              placeholder="SĐT"
              defaultValue={editingEmployee?.phone || ""}
              required
            />
          </label>

          <label>
            Số căn cước
            <input
              name="identity_card"
              placeholder="Số căn cước"
              defaultValue={editingEmployee?.identity_card || ""}
              required
            />
          </label>

          <label>
            Ngày sinh
            <input
              name="birthdate"
              type="date"
              defaultValue={formatDateForInput(editingEmployee?.birthdate)}
              required
            />
          </label>
          <label>
            Giới tính
            <select
              name="gender"
              defaultValue={editingEmployee?.gender || ""}
              required
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </label>

          <label>
            Nơi làm việc
            <Select
              options={theaters.map((t) => ({
                value: t.name,
                label: t.name,
              }))}
              value={workplace ? { value: workplace, label: workplace } : null}
              onChange={(selectedOption) => {
                setWorkplace(selectedOption?.value || "");
              }}
              placeholder="Nơi làm việc"
              isSearchable
            />
          </label>

          {!editingEmployee && (
            <label>
              Mật khẩu
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: "90%" }}
                    placeholder="Tạo mật khẩu"
                    name="password"
                  />
                  <span
                    onClick={togglePassword}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "60%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#888",
                      fontSize: "18px",
                    }}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPassword(generateRandomPassword())}
                  style={{
                    marginLeft: "10px",
                    marginTop: "4px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    color: "black",
                    border: "1px solid #ccc",
                    backgroundColor: "#f0f0f0",
                    whiteSpace: "nowrap",
                    width: "30%",
                    zIndex: 1,
                  }}
                >
                  Tạo mật khẩu
                </button>
              </div>
            </label>
          )}

          <div className="employee-form-actions">
            <button type="button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit">{editingEmployee ? "Lưu" : "Thêm"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
