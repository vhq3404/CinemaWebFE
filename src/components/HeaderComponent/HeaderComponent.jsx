import React, { useState } from "react";
import "./HeaderComponent.css";
import AuthModal from "../AuthModal/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions";

const HeaderComponent = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
  };

  const handleLogout = () => {
    setIsLoading(true); 

    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logout());

      setIsLoading(false); // Tắt loading sau khi xử lý đăng xuất
      window.location.href = "/"; // Chuyển hướng về trang chủ sau khi đăng xuất
    }, 600);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <a href="/" className="logo">
            🎥 CinemaHub
          </a>
        </div>
        <div className="header-center">
          <nav className="nav">
            <a href="/movies">Phim</a>
            <a href="/theater">Rạp</a>
            <a href="/about">Giới thiệu</a>
            {user && user.role === "admin" && <a href="/management">Quản lý</a>}
          </nav>
        </div>
        <div className="header-right">
          <nav className="nav">
            {user ? (
              <>
                <span className="nav-user">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="nav-logout_button"
                  disabled={isLoading}
                >
                  {isLoading ? "Đăng xuất" : "Đăng xuất"}
                </button>
              </>
            ) : (
              <button onClick={toggleLoginForm} className="nav-login_button">
                Đăng nhập
              </button>
            )}
          </nav>
        </div>
      </header>

      {showLoginForm && <AuthModal onClose={toggleLoginForm} />}
    </>
  );
};

export default HeaderComponent;
