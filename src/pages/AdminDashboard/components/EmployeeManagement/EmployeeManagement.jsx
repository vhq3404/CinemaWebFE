import React, { useEffect, useState } from "react";
import "./EmployeeManagement.css";
import EmployeeForm from "./EmployeeForm";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [workplaceFilter, setWorkplaceFilter] = useState("");

  const removeVietnameseTones = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD") 
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const filteredEmployees = employees.filter((emp) => {
    const keyword = removeVietnameseTones(searchTerm);

    const fullName = removeVietnameseTones(emp.fullName || emp.name || "");
    const email = (emp.email || "").toLowerCase();
    const phone = (emp.phone || "").toLowerCase();
    const identityCard = (
      emp.identity_card ||
      emp.identityCard ||
      ""
    ).toLowerCase();

    const matchesSearch =
      fullName.includes(keyword) ||
      email.includes(keyword) ||
      phone.includes(keyword) ||
      identityCard.includes(keyword);

    const matchesWorkplace =
      !workplaceFilter || emp.workplace === workplaceFilter;

    return matchesSearch && matchesWorkplace;
  });

  const workplaces = Array.from(
    new Set(employees.map((e) => e.workplace))
  ).filter(Boolean);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  const fetchEmployees = () => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu nhân viên");
        return res.json();
      })
      .then((data) => {
        const employeeList = data.employees.filter(
          (user) => user.role === "employee"
        );
        setEmployees(employeeList);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddClick = () => {
    setEditingEmployee(null);
    setShowOverlay(true);
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setShowOverlay(true);
  };

  const handleDeleteClick = (id) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      fetch(`${process.env.REACT_APP_API_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Xóa thất bại");
          fetchEmployees();
        })
        .catch((err) => alert(err.message));
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  if (loading) return <p>Đang tải danh sách nhân viên...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="employee-management">
      <h2>Quản lý nhân viên</h2>

      <div className="employee-toolbar">
        <div className="employee-filters">
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT hoặc CCCD"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="employee-search-input"
          />
          <select
            className="employee-workplace-filter"
            value={workplaceFilter}
            onChange={(e) => setWorkplaceFilter(e.target.value)}
          >
            <option value="">Lọc nơi làm việc</option>
            {workplaces.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </div>

        <div className="employee-add-button-container">
          <button className="employee-add-button" onClick={handleAddClick}>
            Thêm nhân viên
          </button>
        </div>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Số căn cước</th>
            <th>Ngày sinh</th>
            <th>Nơi làm việc</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.fullName || emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.identity_card || emp.identityCard}</td>
              <td>{formatDate(emp.dob || emp.birthdate)}</td>
              <td>{emp.workplace}</td>
              <td>
                <button
                  className="employee-action-button edit"
                  onClick={() => handleEditClick(emp)}
                >
                  Sửa
                </button>
                <button
                  className="employee-action-button delete"
                  onClick={() => handleDeleteClick(emp.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showOverlay && (
        <EmployeeForm
          editingEmployee={editingEmployee}
          onClose={closeOverlay}
          onSuccess={closeOverlay}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;
