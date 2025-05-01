import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./BannerComponent.css";

const banners = [
  {
    id: 1,
    image:
      "https://thethaovanhoa.mediacdn.vn/zoom/500_281/372676912336973824/2025/3/20/image1-26-1742462677396744926227-19-0-666-1152-crop-17424626840491844343314.jpeg",
  },
  {
    id: 2,
    image:
      "https://cdn-images.vtv.vn/thumb_w/1200/66349b6076cb4dee98746cf1/2025/03/31/maxresdefault-15586237029953833826068.jpg",
  },
  {
    id: 3,
    image:
      "https://simg1zen.myclip.vn/image1/2024/01/17/15/ac8c3aa3/ac8c3aa3-7e4b-4745-aa36-8d5f587793e3_720_405.jpg",
  },

  {
    id: 4,
    image:
      "https://preview.redd.it/new-banner-for-thunderbolts-has-been-released-v0-0ya6h38enhte1.jpeg?auto=webp&s=d03eae77bb9495376217a56aa408a68f78f62af9",
  },

  {
    id: 5,
    image:
      "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/3/image/1800x/71252117777b696995f01934522c402d/6/4/640x396-ttk.jpg",
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
        spaceBetween={650}
        centeredSlides={true}
        slidesPerView={3}
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
