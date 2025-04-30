import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./TrendingMoviesComponent.css";

const TrendingMoviesComponent = () => {
  const navigate = useNavigate(); 

  const movies = [
    { id: 1, title: "7 Ngày Bên NNhau", image: "https://static2.vieon.vn/vieplay-image/thumbnail_v4/2025/03/19/axch3zfe_1920x1080-7ngaybennhau.png" },
    { id: 2, title: "Xác Ướp 2017", image: "https://static2.vieon.vn/vieplay-image/thumbnail_big_v4/2023/09/14/b39hawke_1920x1080xacuop_1267_712.webp" },
    { id: 3, title: "Tôi Ti Tiện 4", image: "https://static2.vieon.vn/vieplay-image/carousel_web_v4/2025/02/21/o8ee9dtf_1920x1080-toititien4_1920_1080.jpg" },
    { id: 4, title: "Liên Hoa Lâu", image: "https://images.fptplay53.net/media/OTT/VOD/2023/11/22/lien-hoa-lau-fpt-play-1700647992640_Landscape.jpg" },
    { id: 5, title: "Ma Búp Bê", image: "https://static2.vieon.vn/vieplay-image/thumbnail_big_v4/2023/07/05/vskmu8kw_1920x1080-mabupbe_1267_712.webp" },
    { id: 6, title: "Vân Chi Vũ", image: "https://foxnews.fpt.vn/wp-content/uploads/2023/09/06.jpg" },
  ];

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`); 
  };

  const handleViewAll = () => {
    navigate("/trending-movies"); 
  };

  return (
    <div className="trending-movies">
      <div className="trending-header">
        <h2>Phim Thịnh Hành</h2>
        <button className="view-all-button" onClick={handleViewAll}>
          Xem tất cả
        </button>
      </div>
      <div className="movies-grid">
        {movies.map((movie) => (
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

export default TrendingMoviesComponent;