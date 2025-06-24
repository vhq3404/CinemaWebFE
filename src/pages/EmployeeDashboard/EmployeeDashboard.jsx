import React, { useState, useEffect } from "react";
import "./EmployeeDashboard.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { MdOutlinePeopleAlt, MdOutlineDiscount } from "react-icons/md";
import { HiOutlineTicket } from "react-icons/hi2";
import { MdLocalMovies } from "react-icons/md";
import BookingManagement from "./BookingManagement/BookingManagement";
import TheaterShowtimes from "../../components/MovieShowtimes/TheaterShowtime";
import UserManagement from "./UserManagement/UserManagement";
import SchedulePage from "../SchedulePage/SchedulePage";
import { GrSchedulePlay } from "react-icons/gr";
import NewsPage from "../NewsPage/NewsPage";

const EmployeeDashboard = () => {
  const user = useSelector((state) => state.user);
  const [theaterId, setTheaterId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("bookings");
  console.log("theaterId", theaterId);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/theaters`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((theater) => theater.name === user?.workplace);
        setTheaterId(found?.id || null);
      });
  }, [user?.workplace]);

  if (!user || user.role !== "employee") {
    return <Navigate to="/" />;
  }

  const renderContent = () => {
    switch (selectedTab) {
      case "bookings":
        return <BookingManagement />;
      case "movies":
        return <TheaterShowtimes theaterId={theaterId} />;
      case "users":
        return <UserManagement />;
      case "promotions":
        return <NewsPage isAdminOrEmployee={true} />;
      case "schedules":
        return <SchedulePage/>;
      default:
        return (
          <>
            <h1>Trang quản trị hệ thống</h1>
            <p>Chọn một chức năng quản lý từ thanh bên trái.</p>
          </>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li
            className={`sidebar-item ${
              selectedTab === "bookings" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("bookings")}
          >
            <HiOutlineTicket /> Bookings
          </li>
          <li
            className={`sidebar-item ${
              selectedTab === "users" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("users")}
          >
            <MdOutlinePeopleAlt /> Users
          </li>
          <li
            className={`sidebar-item ${
              selectedTab === "movies" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("movies")}
          >
            <MdLocalMovies /> Movies
          </li>
          <li
            className={`sidebar-item ${
              selectedTab === "schedules" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("schedules")}
          >
            <GrSchedulePlay /> Showtimes
          </li>
          <li
            className={`sidebar-item ${
              selectedTab === "promotions" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("promotions")}
          >
            <MdOutlineDiscount /> Promotions
          </li>
        </ul>
      </aside>
      <main
        className={`admin-content ${
          selectedTab === "movies" ? "movies-tab-spacing" : ""
        }`}
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
