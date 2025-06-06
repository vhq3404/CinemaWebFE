import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./BannerComponent.css";
import banner1 from "../../assets/happy T.png";
import banner2 from "../../assets/u22.png";
import banner3 from "../../assets/membership.png";

const banners = [
  {
    id: 1,
    image: banner1,
  },
  {
    id: 2,
    image: banner2,
  },
  {
    id: 3,
    image: banner3,
  },

  {
    id: 4,
    image: banner2,
  },

  {
    id: 5,
    image: banner1,
  },
];

const BannerComponent = () => {
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
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerComponent;
