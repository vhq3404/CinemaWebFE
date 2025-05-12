import React, { useState } from "react";
import "./ProfilePage.css";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("profile"); // Tab mặc định là "Thông tin tài khoản"

  if (!user) {
    return <p>Bạn cần đăng nhập để xem thông tin tài khoản.</p>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="profile-tab-content">
            <h2>Thông Tin Tài Khoản</h2>
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Số điện thoại:</strong> {user.phone || "Chưa cập nhật"}</p>
            <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}</p>
          </div>
        );
      case "history":
        return (
          <div className="profile-tab-content">
            <h2>Lịch Sử Giao Dịch</h2>
            <ul>
              <li>Giao dịch 1: Đặt vé Avengers - 200.000 VND - <span className="status success">Thành công</span></li>
              <li>Giao dịch 2: Đặt vé Spider-Man - 150.000 VND - <span className="status pending">Đang xử lý</span></li>
              <li>Giao dịch 3: Đặt vé Batman - 180.000 VND - <span className="status failed">Thất bại</span></li>
            </ul>
          </div>
        );
      case "vouchers":
        return (
          <div className="profile-tab-content">
            <h2>Voucher Của Tôi</h2>
            <ul>
              <li>Mã: DISCOUNT10 - Giảm giá 10% - Hạn: 31/12/2025</li>
              <li>Mã: FREESHIP - Miễn phí vận chuyển - Hạn: 30/11/2025</li>
            </ul>
          </div>
        );
      case "settings":
        return (
          <div className="profile-tab-content">
            <h2>Cài Đặt</h2>
            <form>
              <label>
                Mật khẩu cũ:
                <input type="password" placeholder="Nhập mật khẩu cũ" />
              </label>
              <label>
                Mật khẩu mới:
                <input type="password" placeholder="Nhập mật khẩu mới" />
              </label>
              <label>
                Xác nhận mật khẩu mới:
                <input type="password" placeholder="Xác nhận mật khẩu mới" />
              </label>
              <button type="submit">Đổi mật khẩu</button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <h1>Thông Tin Tài Khoản</h1>
      <div className="profile-tabs">
        <button
          className={`profile-tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Thông Tin Tài Khoản
        </button>
        <button
          className={`profile-tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Lịch Sử Giao Dịch
        </button>
        <button
          className={`profile-tab-button ${activeTab === "vouchers" ? "active" : ""}`}
          onClick={() => setActiveTab("vouchers")}
        >
          Voucher Của Tôi
        </button>
        <button
          className={`profile-tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Cài Đặt
        </button>
      </div>
      <div className="profile-tab-content-container">{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePage;