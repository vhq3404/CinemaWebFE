import React, { useState, useEffect } from "react";
import "./BannerComponent.css";

const BannerComponent = () => {
  const banners = [
    { id: 1, image: "https://th.bing.com/th/id/R.af2c5dceae5a8a5592f707c4c793543b?rik=Rj5Pyfif9tLGGQ&pid=ImgRaw&r=0" },
    { id: 2, image: "https://vtv.gov.vn/uploads/ketnoi/422/vtvnet/2024/thang-8/hanh-phuc-bi-danh-cap-2.jpg" },
    { id: 3, image: "https://streamcoimg-a.akamaihd.net/000/311/196/311196-Banner-L2-fd1b8e0023ceb996fe9b1406787c5a04.jpg" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        handleNext();
      }
    }, 3000); // Tự động chuyển sau 3 giây
    return () => clearInterval(interval);
  }, [currentIndex, isHovered]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handleBack = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  return (
    <div
      className="banner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={banners[currentIndex].image}
        alt={`Banner ${currentIndex + 1}`}
        className="banner-image"
      />
      <button className="banner-button back" onClick={handleBack}>
        &#8249;
      </button>
      <button className="banner-button next" onClick={handleNext}>
        &#8250;
      </button>
    </div>
  );
};

export default BannerComponent;