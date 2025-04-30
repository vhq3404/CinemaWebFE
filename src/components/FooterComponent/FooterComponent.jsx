import React from "react";
import "./FooterComponent.css";

const FooterComponent = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Về Chúng Tôi</h4>
          <ul>
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Thành tựu</a></li>
            <li><a href="#">Đội ngũ</a></li>
            <li><a href="#">Đối tác</a></li>
            <li><a href="#">Tin tức</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li><a href="#">Thư viện ảnh</a></li>
            <li><a href="#">Giải thưởng</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Tổ chức</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>📞 (+63) 236 6322</p>
          <p>📧 public@news.com</p>
          <p>📍 Khu phố 6, P.Linh Trung, Tp.Thủ Đức, Tp.Hồ Chí Minh</p>
        </div>

        <div className="footer-section">
          <h4>Giờ làm việc</h4>
          <p>Thứ 2 - Thứ 6: 10:00 - 18:00</p>
          <p>Thứ 7 - Chủ nhật: 10:00 - 18:00</p>
        </div>
      </div>

      <div className="footer-bottom">
        © Copyright 2023 | CinemaHub
      </div>
    </footer>
  );
};

export default FooterComponent;
