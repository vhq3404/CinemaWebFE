import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import banner1 from "../../assets/happy T.png";
import banner2 from "../../assets/u22.png";
import banner3 from "../../assets/membership.png";
import "./NewsPage.css";

const NewsPage = () => {
  const { id } = useParams();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 800)); 
        const res = {
          data: [
            {
              id: 1,
              title: "Giảm giá 50% vé thứ 3",
              description: "Mua 2 vé, vé thứ 3 giảm 50% áp dụng tất cả phim.",
              startDate: "2025-06-01",
              endDate: "2025-06-15",
              image: banner1,
            },
            {
              id: 2,
              title: "Combo bắp nước miễn phí",
              description: "Mua vé trên 100k được tặng combo bắp + nước.",
              startDate: "2025-06-10",
              endDate: "2025-06-30",
              image: banner2,
            },
            {
              id: 3,
              title: "Giảm giá học sinh - sinh viên",
              description: "Xuất trình thẻ học sinh/sinh viên được giảm 20%.",
              startDate: "2025-05-20",
              endDate: "2025-07-20",
              image: banner3,
            },
          ],
        };

        setPromotions(res.data);
        setError("");
      } catch (err) {
        setError("Lỗi khi tải dữ liệu khuyến mãi");
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [id]);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  if (loading) return <p className="promotion-loading">Đang tải ưu đãi...</p>;
  if (error) return <p className="promotion-error">{error}</p>;
  if (!promotions.length) return <p className="promotion-empty">Chưa có ưu đãi nào.</p>;

  return (
    <div className="promotion-page">
      <h1 className="promotion-title">Ưu đãi rạp phim</h1>
      <ul className="promotion-list">
        {promotions.map((promo) => (
          <li key={promo.id} className="promotion-item">
            <img src={promo.image} alt={promo.title} className="promotion-image" />
            <div className="promotion-info">
              <h2 className="promotion-item-title">{promo.title}</h2>
              <p className="promotion-item-description">{promo.description}</p>
              <p className="promotion-item-dates">
                Thời gian: {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsPage;
