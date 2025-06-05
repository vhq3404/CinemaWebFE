import React, { useState } from "react";
import "./EmployeeDashboard.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { HiOutlineTicket } from "react-icons/hi2";
import BookingManagement from "./BookingManagement/BookingManagement";
import UserManagement from "./UserManagement/UserManagement";

const EmployeeDashboard = () => {
  const user = useSelector((state) => state.user);
  const [selectedTab, setSelectedTab] = useState("bookings");

  if (!user || user.role !== "employee") {
    return <Navigate to="/" />;
  }

  const renderContent = () => {
    switch (selectedTab) {
      case "bookings":
        return <BookingManagement />;

      case "users":
        return <UserManagement />;

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
        </ul>
      </aside>

      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default EmployeeDashboard;
