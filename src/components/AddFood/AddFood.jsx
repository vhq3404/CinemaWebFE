import React, { useState, useEffect } from "react";
import "./AddFood.css";

function AddFood({ onClose, onFoodAdded, editingFood }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    type: "bắp",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingFood) {
      setFormData({
        name: editingFood.name || "",
        description: editingFood.description || "",
        price: editingFood.price || "",
        isAvailable: editingFood.isAvailable ?? true,
        type: editingFood.type || "bắp",
      });
    }
  }, [editingFood]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("data", JSON.stringify(formData));
    if (image) form.append("image", image);

    const url = editingFood
      ? `http://localhost:5007/api/foods/${editingFood._id}`
      : "http://localhost:5007/api/foods";

    const method = editingFood ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi lưu món ăn");

      onFoodAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="add-food-overlay" onClick={onClose}>
      <div className="add-food-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{editingFood ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Tên món ăn"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Mô tả"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            name="price"
            type="number"
            placeholder="Giá"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <label>
            <input
              name="isAvailable"
              type="checkbox"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            Còn hàng
          </label>
          <br />
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="bắp">Bắp</option>
            <option value="nước">Nước</option>
            <option value="combo">Combo</option>
          </select>
          <br />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFood;
