import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./TheaterGallery.css";

const TheaterGallery = ({ theater }) => {
  const [galleries, setGalleries] = useState([]);

  useEffect(() => {
    if (!theater) return;

    const fetchGallery = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/theaters/${theater.id}/gallery`);
        const data = await response.json();
        setGalleries(data);
      } catch (err) {
        console.error("Lỗi khi tải ảnh gallery:", err);
      }
    };

    fetchGallery();
  }, [theater]);

  return (
    <div className="gallery-container">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop
        autoplay={{ delay: 3000 }}
        spaceBetween={0}
        centeredSlides={true}
        slidesPerView={1}
      >
        {galleries.map((gallery) => (
          <SwiperSlide key={gallery.id}>
            <div className="slide-wrapper">
              <img
                src={`http://localhost:8080/theaters${gallery.image_url}`}
                alt={`Banner ${gallery.id}`}
                className="gallery-img"
              />
            </div>
          </SwiperSlide>
        ))}

        <div className="theater-overlay">
          <div className="theater-info-row">
            <div>
              <h3>Địa chỉ: {theater.address}</h3>
              <h3>Hotline: {theater.hotline}</h3>
            </div>
            <button
              className="map-button"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    theater.address
                  )}`,
                  "_blank"
                )
              }
            >
              Xem bản đồ
            </button>
          </div>
        </div>
      </Swiper>
    </div>
  );
};

export default TheaterGallery;
