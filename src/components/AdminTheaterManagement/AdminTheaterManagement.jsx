import React, { useState, useEffect } from "react";
import "./AdminTheaterManagement.css";

const AdminTheaterManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTheater, setEditingTheater] = useState(null); // Rạp đang được chỉnh sửa
  const [newTheater, setNewTheater] = useState({
    name: "",
    address: "",
    phone: "",
    brand: "",
    type: "",
  });

  // Dữ liệu giả
  const mockTheaters = [
    {
      id: 1,
      name: "Rạp CGV Vincom",
      address: "Vincom Center, Quận 1, TP.HCM",
      phone: "0123 456 789",
      brand: "CGV",
      type: "2D",
    },
    {
      id: 2,
      name: "Rạp Lotte Cinema",
      address: "Lotte Mart, Quận 7, TP.HCM",
      phone: "0987 654 321",
      brand: "Lotte",
      type: "3D",
    },
  ];

  useEffect(() => {
    // Giả lập gọi API
    setTimeout(() => {
      setTheaters(mockTheaters);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTheater({ ...newTheater, [name]: value });
  };

  const handleAddTheater = () => {
    if (!newTheater.name || !newTheater.address || !newTheater.phone || !newTheater.brand || !newTheater.type) {
      alert("Vui lòng điền đầy đủ thông tin rạp!");
      return;
    }

    const newId = theaters.length ? theaters[theaters.length - 1].id + 1 : 1;
    setTheaters([...theaters, { ...newTheater, id: newId }]);
    setNewTheater({ name: "", address: "", phone: "", brand: "", type: "" });
  };

  const handleEditTheater = (theater) => {
    setEditingTheater(theater);
  };

  const handleSaveEdit = () => {
    setTheaters(
      theaters.map((theater) =>
        theater.id === editingTheater.id ? editingTheater : theater
      )
    );
    setEditingTheater(null);
  };

  const handleDeleteTheater = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa rạp này?")) {
      setTheaters(theaters.filter((theater) => theater.id !== id));
    }
  };

  return (
    <div className="admin-theater-management">
      <h1>Quản Lý Rạp</h1>

      {/* Thêm rạp mới */}
      <div className="add-theater">
        <h2>Thêm Rạp Mới</h2>
        <input
          type="text"
          name="name"
          placeholder="Tên rạp"
          value={newTheater.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Địa chỉ"
          value={newTheater.address}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={newTheater.phone}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="brand"
          placeholder="Thương hiệu"
          value={newTheater.brand}
          onChange={handleInputChange}
        />
        <select
          name="type"
          value={newTheater.type}
          onChange={handleInputChange}
        >
          <option value="">Chọn Loại rạp</option>
          <option value="2D">2D</option>
          <option value="3D">3D</option>
          <option value="IMAX">IMAX</option>
        </select>
        <button onClick={handleAddTheater}>Thêm Rạp</button>
      </div>

      {/* Danh sách rạp */}
      {loading ? (
        <p className="loading">Đang tải danh sách rạp...</p>
      ) : (
        <div className="theaters-grid">
          {theaters.map((theater) => (
            <div key={theater.id} className="theater-card">
              {editingTheater && editingTheater.id === theater.id ? (
                <>
                  <input
                    type="text"
                    value={editingTheater.name}
                    onChange={(e) =>
                      setEditingTheater({
                        ...editingTheater,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    value={editingTheater.address}
                    onChange={(e) =>
                      setEditingTheater({
                        ...editingTheater,
                        address: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    value={editingTheater.phone}
                    onChange={(e) =>
                      setEditingTheater({
                        ...editingTheater,
                        phone: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    value={editingTheater.brand}
                    onChange={(e) =>
                      setEditingTheater({
                        ...editingTheater,
                        brand: e.target.value,
                      })
                    }
                  />
                  <select
                    value={editingTheater.type}
                    onChange={(e) =>
                      setEditingTheater({
                        ...editingTheater,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                  </select>
                  <button onClick={handleSaveEdit}>Lưu</button>
                </>
              ) : (
                <>
                  <h3>{theater.name}</h3>
                  <p>Địa chỉ: {theater.address}</p>
                  <p>Số điện thoại: {theater.phone}</p>
                  <p>Thương hiệu: {theater.brand}</p>
                  <p>Loại rạp: {theater.type}</p>
                  <div className="theater-actions">
                    <button onClick={() => handleEditTheater(theater)}>
                      Sửa
                    </button>
                    <button onClick={() => handleDeleteTheater(theater.id)}>
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTheaterManagement;