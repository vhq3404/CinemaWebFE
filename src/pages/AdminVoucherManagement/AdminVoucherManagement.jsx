import React, { useState } from "react";
import "./AdminVoucherManagement.css";

const AdminVoucherManagement = () => {
  const [vouchers, setVouchers] = useState([
    { id: 1, code: "DISCOUNT10", discount: "10%", expiry: "2025-12-31" },
    { id: 2, code: "FREESHIP", discount: "Miễn phí vận chuyển", expiry: "2025-11-30" },
  ]);
  const [newVoucher, setNewVoucher] = useState({ code: "", discount: "", expiry: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVoucher({ ...newVoucher, [name]: value });
  };

  const handleAddVoucher = () => {
    if (!newVoucher.code || !newVoucher.discount || !newVoucher.expiry) {
      alert("Vui lòng điền đầy đủ thông tin voucher!");
      return;
    }

    const newId = vouchers.length ? vouchers[vouchers.length - 1].id + 1 : 1;
    setVouchers([...vouchers, { ...newVoucher, id: newId }]);
    setNewVoucher({ code: "", discount: "", expiry: "" });
  };

  const handleDeleteVoucher = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      setVouchers(vouchers.filter((voucher) => voucher.id !== id));
    }
  };

  return (
    <div className="admin-voucher-management">
      <h1>Quản Lý Voucher</h1>

      <div className="add-voucher">
        <h2>Thêm Voucher Mới</h2>
        <input
          type="text"
          name="code"
          placeholder="Mã voucher"
          value={newVoucher.code}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="discount"
          placeholder="Giảm giá"
          value={newVoucher.discount}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="expiry"
          placeholder="Ngày hết hạn"
          value={newVoucher.expiry}
          onChange={handleInputChange}
        />
        <button onClick={handleAddVoucher}>Thêm Voucher</button>
      </div>

      <div className="voucher-list">
        <h2>Danh Sách Voucher</h2>
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="voucher-card">
            <p><strong>Mã:</strong> {voucher.code}</p>
            <p><strong>Giảm giá:</strong> {voucher.discount}</p>
            <p><strong>Hạn sử dụng:</strong> {voucher.expiry}</p>
            <button onClick={() => handleDeleteVoucher(voucher.id)}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVoucherManagement;