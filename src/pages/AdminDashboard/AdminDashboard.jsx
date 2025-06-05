import React, { useState } from "react";
import "./AdminDashboard.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { MdLocalMovies } from "react-icons/md";
import { GiTheater } from "react-icons/gi";
import { GrSchedulePlay } from "react-icons/gr";
import { FaUtensils } from "react-icons/fa";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { FaChartLine } from "react-icons/fa6";
import RevenueReportPage from "./RevenueReportPage/RevenueReportPage";
import MoviePage from "../../components/MoviePage/MoviePage";
import TheaterPage from "../TheaterPage/TheaterPage";
import SchedulePage from "../SchedulePage/SchedulePage";
import FoodList from "../../components/FoodList/FoodList";
import EmployeeManagement from "./EmployeeManagement/EmployeeManagement";

const AdminDashboard = () => {
  const user = useSelector((state) => state.user);
  const [selectedTab, setSelectedTab] = useState("revenue");

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
        return <FoodList />;
      case "revenue":
        return <RevenueReportPage />;
      case "employees":
        return <EmployeeManagement />;

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
            className={`sidebar-item ${
              selectedTab === "revenue" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("revenue")}
          >
            <FaChartLine /> Revenue
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
              selectedTab === "theaters" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("theaters")}
          >
            <GiTheater /> Theaters
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
              selectedTab === "foods" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("foods")}
          >
            <FaUtensils /> Foods
          </li>
          <li
            className={`sidebar-item ${
              selectedTab === "employees" ? "active" : ""
            }`}
            onClick={() => setSelectedTab("employees")}
          >
            <MdOutlinePeopleAlt /> Employees
          </li>
        </ul>
      </aside>

      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;
