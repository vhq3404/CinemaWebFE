import React, { useState } from 'react';
import './HeaderComponent.css';
import AuthModal from '../AuthModal/AuthModal';

const HeaderComponent = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
  };

  return (
    <>
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
          <button onClick={toggleLoginForm} className="nav-login_button">Đăng nhập</button>
          </nav>
        </div>
      </header>

      {showLoginForm && <AuthModal onClose={toggleLoginForm} />}
    </>
  );
};

export default HeaderComponent;
