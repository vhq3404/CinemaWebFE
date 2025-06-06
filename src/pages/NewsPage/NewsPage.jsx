import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./NewsPage.css";

const NewsPage = ({ isAdminOrEmployee = false }) => {
  const { id } = useParams();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID đang chỉnh sửa

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    applicableTime: "",
    image: null,
  });

  useEffect(() => {
    fetchPromotions();
  }, [id]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/promotions`
      );
      // Sắp xếp promotions theo ngày cập nhật giảm dần (mới nhất lên đầu)
      const sortedPromotions = response.data.sort((a, b) => {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      setPromotions(sortedPromotions);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải dữ liệu khuyến mãi");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromotion((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewPromotion((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newPromotion.title);
    formData.append("description", newPromotion.description);
    if ((newPromotion.applicableTime || "").trim() !== "") {
      formData.append("applicableTime", newPromotion.applicableTime);
    }
    if (newPromotion.image) formData.append("image", newPromotion.image);

    try {
      if (editingId) {
        // Update promotion
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/promotions/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // Create new promotion
        if (!newPromotion.image) {
          alert("Vui lòng chọn ảnh.");
          return;
        }
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/promotions`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      await fetchPromotions();
      resetForm();
    } catch (err) {
      console.error("Lỗi khi lưu khuyến mãi:", err.response?.data || err);
      alert(
        "Thao tác thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa ưu đãi này?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/promotions/${promoId}`
      );
      await fetchPromotions();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Xóa thất bại.");
    }
  };

  const handleEdit = (promo) => {
    setNewPromotion({
      title: promo.title,
      description: promo.description,
      applicableTime: promo.applicableTime,
      image: null, // không thể prefill file
    });
    setEditingId(promo._id || promo.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setNewPromotion({
      title: "",
      description: "",
      applicableTime: "",
      image: null,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="promotion-page">
      <h1 className="promotion-title">Ưu đãi rạp phim</h1>

      <div className="promotion-header">
        {isAdminOrEmployee && (
          <button
            className="create-promotion-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            Tạo ưu đãi mới
          </button>
        )}
      </div>

      {loading && <p className="promotion-loading">Đang tải ưu đãi...</p>}
      {error && <p className="promotion-error">{error}</p>}
      {!loading && !promotions.length && (
        <p className="promotion-empty">Chưa có ưu đãi nào.</p>
      )}

      <ul className="promotion-list">
        {promotions.map((promo) => (
          <li key={promo._id || promo.id} className="promotion-item">
            <img
              src={`${process.env.REACT_APP_API_URL}/promotions/${promo.image}`}
              alt={promo.title}
              className="promotion-image"
            />

            <div className="promotion-info">
              <h2 className="promotion-item-title">{promo.title}</h2>
              <p className="promotion-item-description">{promo.description}</p>
              {promo.applicableTime && promo.applicableTime.trim() !== "" && (
                <p className="promotion-item-dates">
                  Thời gian áp dụng: {promo.applicableTime}
                </p>
              )}

              {isAdminOrEmployee && (
                <div className="promotion-buttons">
                  <button onClick={() => handleEdit(promo)}>Sửa</button>
                  <button onClick={() => handleDelete(promo._id || promo.id)}>
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <div className="promotion-overlay" onClick={resetForm}>
          <div
            className="promotion-form-container"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingId ? "Chỉnh sửa ưu đãi" : "Tạo ưu đãi mới"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Tiêu đề"
                value={newPromotion.title}
                onChange={handleInputChange}
                required
                disabled={!isAdminOrEmployee}
              />
              <textarea
                name="description"
                placeholder="Mô tả"
                value={newPromotion.description}
                onChange={handleInputChange}
                required
                disabled={!isAdminOrEmployee}
              />
              <input
                type="text"
                name="applicableTime"
                placeholder="Thời gian áp dụng"
                value={newPromotion.applicableTime}
                onChange={handleInputChange}
                disabled={!isAdminOrEmployee}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!isAdminOrEmployee}
              />
              <div className="promotion-form-buttons">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={!isAdminOrEmployee}
                >
                  Hủy
                </button>
                <button type="submit" disabled={!isAdminOrEmployee}>
                  {editingId ? "Lưu" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
