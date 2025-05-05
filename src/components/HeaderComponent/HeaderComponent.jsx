import React, { useState } from "react";
import "./HeaderComponent.css";
import AuthModal from "../AuthModal/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions";
import { Link } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { BsPersonBadge } from "react-icons/bs";
import { HiOutlineTicket } from "react-icons/hi";

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
                <div className="nav-user-dropdown">
                  <span className="nav-user">Xin chào, {user.name}</span>
                  <div className="dropdown-menu">
                    <Link to="/ticket" className="dropdown-item">
                      <HiOutlineTicket />
                      Vé của tôi
                    </Link>

                    <Link to="/profile" className="dropdown-item">
                      <BsPersonBadge />
                      Tài khoản
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="dropdown-item"
                      disabled={isLoading}
                    >
                      <MdLogout />
                      {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                    </button>
                  </div>
                </div>
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
