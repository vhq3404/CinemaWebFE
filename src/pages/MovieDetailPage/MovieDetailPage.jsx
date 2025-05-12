import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // nếu dùng React Router
import axios from "axios";
import "./MovieDetailPage.css";
import { FaRegPlayCircle, FaRegCalendarAlt, FaRegClock } from "react-icons/fa";
import MovieAgeBadge from "../../components/MovieAgeBadge/MovieAgeBadge";
import MoviePage from "../../components/MoviePage/MoviePage";

const MovieDetailPage = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/movies/${id}`
        );
        setMovie(response.data);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          setError("Không tìm thấy phim");
        } else if (err.response?.status === 400) {
          setError("ID không hợp lệ");
        } else {
          setError("Lỗi khi lấy dữ liệu phim");
        }
      }
    };

    fetchMovie();
  }, [id]);

  // Hàm chuyển link YouTube sang dạng embed, thêm autoplay=1
  const getYoutubeEmbedUrl = (url) => {
    try {
      const urlObj = new URL(url);
      let videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!movie) return <p>Đang tải phim...</p>;

  const getYoutubeThumbnail = (url) => {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1];
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div>
      <div className="movie-detail">
        <div
          className="trailer-banner"
          style={{
            backgroundImage: `url(${getYoutubeThumbnail(movie.trailer)})`,
          }}
        >
           <div className="trailer-gradient-overlay"></div>
          <button className="play-button" onClick={() => setShowTrailer(true)}>
            <FaRegPlayCircle />
          </button>
        </div>

        {/* Thông tin phim */}
        <img
          src={`http://localhost:8080/movies/${movie.poster}`}
          alt={`Poster của ${movie.title}`}
          className="movie-poster-overlay"
        />
        <div className="movie-info-wrapper">
          <div className="movie-info">
            <div className="title-badge-container">
              <div className="title-container">
                <h1 className="movie-detail-title">{movie.title}</h1>
              </div>
              {movie.age !== "unrated" && <MovieAgeBadge age={movie.age} />}
            </div>

            <div className="info-row">
              <label>
                <FaRegClock /> {movie.duration} phút
              </label>
              <label>
                <FaRegCalendarAlt />{" "}
                {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
              </label>
            </div>
            <p>
              <strong>Đạo diễn:</strong> {movie.director}
            </p>
            <p>
              <strong>Diễn viên:</strong> {movie.actors?.join(", ")}
            </p>
            <p>
              <strong>Thể loại:</strong> {movie.genres?.join(", ")}
            </p>
            <p>
              <strong>Quốc gia:</strong> {movie.nation}
            </p>
          </div>
        </div>

        {/* Modal overlay chứa trailer với autoplay */}
        {showTrailer && (
          <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
            <div
              className="iframe-container"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={getYoutubeEmbedUrl(movie.trailer)}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
          </div>
        )}
        <div className="movie-description">
          <label>Giới thiệu phim</label>
          <p>{movie.description}</p>
        </div>
        <div className="movies-list">
        <MoviePage isVertical={true} excludeId={id} />
      </div>
      </div>
      
    </div>
  );
};

export default MovieDetailPage;
