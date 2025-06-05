import React, { useEffect, useState } from "react";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const removeVietnameseTones = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const filteredUsers = users.filter((user) => {
    const keyword = removeVietnameseTones(searchTerm);
    const fullName = removeVietnameseTones(user.fullName || user.name || "");
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();

    return (
      fullName.includes(keyword) ||
      email.includes(keyword) ||
      phone.includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu người dùng");
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter((u) => u.role === "user");
        setUsers(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [searchTerm]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) return <p>Đang tải danh sách người dùng...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="employee-management">
      <h2>Quản lý người dùng</h2>

      <div className="employee-toolbar">
        <div className="employee-filters">
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc SĐT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="employee-search-input"
          />
        </div>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullName || user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{formatDate(user.birthdate)}</td>
              <td>{user.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="user-pagination">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            Trang trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
