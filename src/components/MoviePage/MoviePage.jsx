import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MoviePage.css";

const MoviePage = () => {
  const [activeTab, setActiveTab] = useState("now-showing");
  const navigate = useNavigate();

  const nowShowingMovies = [
    { id: 1, title: "7 Ngày Bên Nhau", image: "https://static2.vieon.vn/vieplay-image/thumbnail_v4/2025/03/19/axch3zfe_1920x1080-7ngaybennhau.png" },
    { id: 2, title: "Xác Ướp 2017", image: "https://static2.vieon.vn/vieplay-image/thumbnail_big_v4/2023/09/14/b39hawke_1920x1080xacuop_1267_712.webp" },
    { id: 3, title: "Tôi Ti Tiện 4", image: "https://static2.vieon.vn/vieplay-image/carousel_web_v4/2025/02/21/o8ee9dtf_1920x1080-toititien4_1920_1080.jpg" },
    { id: 4, title: "Liên Hoa Lâu", image: "https://images.fptplay53.net/media/OTT/VOD/2023/11/22/lien-hoa-lau-fpt-play-1700647992640_Landscape.jpg" },
    { id: 5, title: "Ma Búp Bê", image: "https://static2.vieon.vn/vieplay-image/thumbnail_big_v4/2023/07/05/vskmu8kw_1920x1080-mabupbe_1267_712.webp" },
    { id: 6, title: "Vân Chi Vũ", image: "https://foxnews.fpt.vn/wp-content/uploads/2023/09/06.jpg" },
  ];

  const comingSoonMovies = [
    { id: 7, title: "Thám Tử Kiên", image: "https://cinema.momocdn.net/img/77368526851200910-kien.jpg?size=M" },
    { id: 8, title: "Biệt Đội Sấm Sét", image: "https://www.bhdstar.vn/wp-content/uploads/2025/04/referenceSchemeHeadOfficeallowPlaceHoldertrueheight700ldapp-6.png" },
    { id: 9, title: "Lật Mặt 8", image: "https://cinema.momocdn.net/img/77210013985876184-lm81.png?size=M" },
    { id: 10, title: "Địa Đạo", image: "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/3/5/350x495-diadao.jpg" },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const moviesToDisplay = activeTab === "now-showing" ? nowShowingMovies : comingSoonMovies;

  return (
    <div className="movie-page">
      <h1>Danh sách phim</h1>
      <div className="tabs">
        <button
          className={activeTab === "now-showing" ? "active" : ""}
          onClick={() => handleTabClick("now-showing")}
        >
          Đang chiếu
        </button>
        <button
          className={activeTab === "coming-soon" ? "active" : ""}
          onClick={() => handleTabClick("coming-soon")}
        >
          Sắp chiếu
        </button>
      </div>
      <div className="movies-grid">
        {moviesToDisplay.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => handleMovieClick(movie.id)}
          >
            <img src={movie.image} alt={movie.title} className="movie-image" />
            <h3 className="movie-title">{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviePage;