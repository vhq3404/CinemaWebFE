import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./BannerComponent.css";

const BannerComponent = () => {
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/promotions`
        );
        const sorted = response.data
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // mới nhất lên đầu
          .slice(0, 6) // lấy 6 cái đầu
          .map((promo, index) => ({
            id: promo._id || index,
            image: `${process.env.REACT_APP_API_URL}/promotions/${promo.image}`,
          }));
        setBanners(sorted);
      } catch (err) {
        console.error("Lỗi khi tải banner khuyến mãi:", err);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <div className="banner-container">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop
        autoplay={{ delay: 3000 }}
        spaceBetween={315}
        centeredSlides={true}
        slidesPerView={3}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 3 },
        }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="banner-img"
              onClick={() => navigate("/news")}
              style={{ cursor: "pointer" }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerComponent;
