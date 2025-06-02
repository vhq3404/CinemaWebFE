import React, { useEffect, useState } from "react";
import AddFood from "../AddFood/AddFood";
import { LuPopcorn } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { IoFastFoodOutline } from "react-icons/io5";
import "./FoodList.css";

function FoodList() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null); // 👈 Thêm state để sửa

  const fetchFoods = () => {
    setLoading(true);
    fetch("http://localhost:5007/api/foods")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy danh sách món ăn");
        return res.json();
      })
      .then((data) => {
        setFoods(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Lỗi không xác định");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món ăn này?")) return;
    try {
      const res = await fetch(`http://localhost:5007/api/foods/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa món ăn thất bại");
      fetchFoods();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setShowAddForm(true);
  };

  const groupByType = (type) => foods.filter((f) => f.type === type);

  const formatCurrency = (number) =>
    number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const renderFoodSection = (title, type) => {
    const items = groupByType(type);
    if (items.length === 0) return null;

    let IconComponent = null;
    if (type === "bắp") IconComponent = LuPopcorn;
    else if (type === "nước") IconComponent = RiDrinks2Fill;
    else if (type === "combo") IconComponent = IoFastFoodOutline;

    return (
      <div className="food-section">
        <h3>
          {IconComponent && (
            <IconComponent
              style={{ verticalAlign: "middle", marginRight: 10 }}
              title={title}
            />
          )}
          {title}
        </h3>
        <div className="food-grid">
          {items.map((food) => (
            <div className="food-card" key={food._id}>
              {food.imageUrl && (
                <img
                  src={`http://localhost:5007/foods/${food.imageUrl}`}
                  alt={food.name}
                  className="food-img"
                />
              )}
              <h4>{food.name}</h4>
              <p>{food.description}</p>
              <p className="food-price">{formatCurrency(food.price)}</p>
              <p
                className={`status ${
                  food.isAvailable ? "available" : "unavailable"
                }`}
              >
                {food.isAvailable ? "Còn hàng" : "Hết hàng"}
              </p>
              <div className="food-action-buttons">
                <button className="food-btn-edit" onClick={() => handleEdit(food)}>
                  Sửa
                </button>
                <button
                  className="food-btn-delete"
                  onClick={() => handleDelete(food._id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="food-list-container">
      <h2>Danh sách món ăn</h2>
      <button
        className="add-food-button"
        onClick={() => {
          setShowAddForm(true);
          setEditingFood(null);
        }}
      >
        Thêm món ăn
      </button>

      {showAddForm && (
        <AddFood
          onClose={() => {
            setShowAddForm(false);
            setEditingFood(null);
          }}
          onFoodAdded={fetchFoods}
          editingFood={editingFood}
        />
      )}

      {foods.length === 0 ? (
        <p>Không có món ăn nào.</p>
      ) : (
        <>
          {renderFoodSection("Bắp", "bắp")}
          {renderFoodSection("Nước", "nước")}
          {renderFoodSection("Combo", "combo")}
        </>
      )}
    </div>
  );
}

export default FoodList;
