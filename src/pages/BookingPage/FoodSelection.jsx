import React, { useEffect, useState } from "react";
import "./FoodSelection.css";

const FoodSelection = ({ selectedFoods = [], onChange }) => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5007/api/foods")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy danh sách món ăn");
        return res.json();
      })
      .then((data) => {
        setFoods(data);
      })
      .catch((err) => {
        console.log("error");
      });
  }, []);

  const handleQuantityChange = (food, delta) => {
    const existing = selectedFoods.find((f) => f._id === food._id);
    if (existing) {
      const updatedQty = existing.quantity + delta;
      if (updatedQty <= 0) {
        onChange(selectedFoods.filter((f) => f._id !== food._id));
      } else {
        onChange(
          selectedFoods.map((f) =>
            f._id === food._id ? { ...f, quantity: updatedQty } : f
          )
        );
      }
    } else if (delta > 0) {
      onChange([...selectedFoods, { ...food, quantity: 1 }]);
    }
  };

  const getQuantity = (foodId) => {
    return selectedFoods.find((f) => f._id === foodId)?.quantity || 0;
  };

  const groupedFoods = {
    combo: foods.filter((f) => f.type === "combo"),
    bắp: foods.filter((f) => f.type === "bắp"),
    nước: foods.filter((f) => f.type === "nước"),
  };

  const formatCurrency = (number) =>
    number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="food-selection">
      <h3>Chọn bắp & nước</h3>

      {Object.entries(groupedFoods).map(([type, items]) => (
        <div key={type}>
          <h4 className="food-type-heading">{type.toUpperCase()}</h4>
          <ul>
            {items.map((food) => (
              <li key={food._id}>
                <div className="food-item">
                  {food.imageUrl && (
                    <img
                      src={`http://localhost:5007/foods/${food.imageUrl}`}
                      alt={food.name}
                      className="food-selection-img"
                    />
                  )}
                  <div
                    style={{
                      flex: "3 1 0",
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: 20,
                    }}
                  >
                    <span className="food-name">{food.name}</span>
                    <div className="food-description">{food.description}</div>
                  </div>
                  <span className="food-price">
                    {formatCurrency(food.price)}
                  </span>
                  <div className="quantity-controls">
                    <button onClick={() => handleQuantityChange(food, -1)}>
                      -
                    </button>
                    <span>{getQuantity(food._id)}</span>
                    <button onClick={() => handleQuantityChange(food, 1)}>
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FoodSelection;
