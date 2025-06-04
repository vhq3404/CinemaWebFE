import React, { useEffect } from "react";
import "./ProfilePage.css";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import UserTickets from "./UserTickets/UserTickets";
import UserProfile from "./UserProfile/UserProfile";

const ProfilePage = () => {
  const user = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const { tab } = useParams(); // Lấy tab từ URL
  const navigate = useNavigate();
  const activeTab = tab || "profile";

  if (!user) {
    return <p>Bạn cần đăng nhập để xem thông tin tài khoản.</p>;
  }

  const handleTabClick = (tabName) => {
    navigate(`/profile/${tabName}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="profile-tab-content">
            <UserProfile userId={user.id} token={token} />
          </div>
        );
      case "ticket":
        return (
          <div className="profile-tab-content">
            <UserTickets userId={user.id} />
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
                <input type="password" />
              </label>
              <label>
                Mật khẩu mới:
                <input type="password" />
              </label>
              <label>
                Xác nhận mật khẩu mới:
                <input type="password" />
              </label>
              <button type="submit">Đổi mật khẩu</button>
            </form>
          </div>
        );
      default:
        return <p>Không tìm thấy nội dung phù hợp.</p>;
    }
  };

  return (
    <div className="profile-page">
      <h1>Thông Tin Tài Khoản</h1>
      <div className="profile-tabs">
        <button
          className={`profile-tab-button ${
            activeTab === "profile" ? "active" : ""
          }`}
          onClick={() => handleTabClick("profile")}
        >
          Thông Tin Tài Khoản
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "ticket" ? "active" : ""
          }`}
          onClick={() => handleTabClick("ticket")}
        >
          Lịch Sử Giao Dịch
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "vouchers" ? "active" : ""
          }`}
          onClick={() => handleTabClick("vouchers")}
        >
          Voucher Của Tôi
        </button>
        <button
          className={`profile-tab-button ${
            activeTab === "settings" ? "active" : ""
          }`}
          onClick={() => handleTabClick("settings")}
        >
          Cài Đặt
        </button>
      </div>
      <div className="profile-tab-content-container">{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePage;
