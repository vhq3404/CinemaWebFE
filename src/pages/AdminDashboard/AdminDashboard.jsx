import React, { useState } from "react";
import "./AdminDashboard.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { MdLocalMovies } from "react-icons/md";
import { GiTheater } from "react-icons/gi";
import { GrSchedulePlay } from "react-icons/gr";
import { FaUtensils } from "react-icons/fa"; // icon cho foods
import MoviePage from "../../components/MoviePage/MoviePage";
import TheaterPage from "../TheaterPage/TheaterPage";
import SchedulePage from "../SchedulePage/SchedulePage";
import FoodList from "../../components/FoodList/FoodList"; // import FoodList

const AdminDashboard = () => {
  const user = useSelector((state) => state.user);
  const [selectedTab, setSelectedTab] = useState("movies");

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  const renderContent = () => {
    switch (selectedTab) {
      case "movies":
        return <MoviePage isAdmin={true} />;
      case "theaters":
        return <TheaterPage isAdmin={true} />;
      case "schedules":
        return <SchedulePage isAdmin={true} />;
      case "foods":
        return <FoodList />;  // tab mới cho foods
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
        <h2>Admin Dashboard</h2>
        <ul>
          <li
            className={`sidebar-item ${selectedTab === "movies" ? "active" : ""}`}
            onClick={() => setSelectedTab("movies")}
          >
            <MdLocalMovies /> Movies
          </li>

          <li
            className={`sidebar-item ${selectedTab === "theaters" ? "active" : ""}`}
            onClick={() => setSelectedTab("theaters")}
          >
            <GiTheater /> Theaters
          </li>

          <li
            className={`sidebar-item ${selectedTab === "schedules" ? "active" : ""}`}
            onClick={() => setSelectedTab("schedules")}
          >
            <GrSchedulePlay /> Showtimes
          </li>

          <li
            className={`sidebar-item ${selectedTab === "foods" ? "active" : ""}`}
            onClick={() => setSelectedTab("foods")}
          >
            <FaUtensils /> Foods
          </li>
        </ul>
      </aside>

      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;
