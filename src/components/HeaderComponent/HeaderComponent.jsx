import React from 'react';
import './HeaderComponent.css'; // Optional: nếu bạn muốn style riêng

const HeaderComponent = () => {
  return (
    <header className="header">
  <div className="header-left">
    <a href="/" className="logo">🎥 CinemaHub</a>
  </div>
  <div className="header-center">
    <nav className="nav">
      <a href="/movies">Phim</a>
      <a href="/theater">Rạp</a>
      <a href="/about">Giới thiệu</a>
    </nav>
  </div>
  <div className="header-right">
  <nav className="nav">
      <a href="/login">Đăng nhập</a>
      </nav>
  </div>
</header>

  );
};

export default HeaderComponent;
