import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CiEdit } from "react-icons/ci";
import { MdRemoveCircleOutline } from "react-icons/md";
import AddMovieComponent from "../AddMovieComponent/AddMovieComponent";
import EditMovieComponent from "../EditMovieComponent/EditMovieComponent";
import MovieAgeBadge from "../MovieAgeBadge/MovieAgeBadge";
import "./MoviePage.css";

const MoviePage = ({ isVertical = false, excludeId = null}) => {
  const [activeTab, setActiveTab] = useState("now_showing");
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showEditMovie, setShowEditMovie] = useState(false);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Lấy danh sách phim khi tab thay đổi
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/movies?status=${activeTab}`
        );
        const data = await res.json();

        let sortedData = [...data];

        if (excludeId) {
          sortedData = sortedData.filter((movie) => movie._id !== excludeId);
        }

        if (activeTab === "now_showing") {
          // Sắp xếp phim đang chiếu: ngày chiếu mới nhất lên đầu
          sortedData.sort(
            (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
          );
        } else if (activeTab === "coming_soon") {
          // Sắp chiếu: phim có ngày chiếu xa nhất lên đầu
          sortedData.sort(
            (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)
          );
        }

        setMovies(sortedData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
      }
    };
    fetchMovies();
  }, [activeTab, excludeId]);

  const toggleAddMovie = () => {
    setShowAddMovie(!showAddMovie);
  };

  const toggleEditMovie = () => {
    setShowEditMovie(!showEditMovie);
  };

  const handleEditMovieClick = (movie) => {
    setSelectedMovie(movie); // Lưu phim đã chọn vào state
    toggleEditMovie(); // Mở form chỉnh sửa
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này không?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/movies/${movieId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // Xóa thành công: cập nhật lại danh sách phim
          setMovies((prev) => prev.filter((movie) => movie._id !== movieId));
          console.log("Xóa thành công");
        } else {
          const err = await res.json();
          console.error("Lỗi khi xóa:", err.message || err);
          alert("Không thể xóa phim.");
        }
      } catch (error) {
        console.error("Lỗi kết nối khi xóa phim:", error);
        alert("Đã xảy ra lỗi khi kết nối đến máy chủ.");
      }
    }
  };

  return (
    <div className={`movie-page ${isVertical ? "vertical" : ""}`}>
      <div className="tabs">
        <div className="tabs-buttons">
          <button
            className={activeTab === "now_showing" ? "active" : ""}
            onClick={() => handleTabClick("now_showing")}
          >
            Đang chiếu
          </button>
          <button
            className={activeTab === "coming_soon" ? "active" : ""}
            onClick={() => handleTabClick("coming_soon")}
          >
            Sắp chiếu
          </button>
        </div>
        {user && user.role === "admin" && !isVertical && (
          <button onClick={toggleAddMovie} className="add-movie-button">
            Thêm phim
          </button>
        )}
      </div>

      <div className={`movies-grid ${isVertical ? "vertical" : ""}`}>
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="movie-card"
            onClick={() => handleMovieClick(movie._id)}
          >
            <div className="movie-poster">
              <img
                src={`http://localhost:8080/${movie.poster}`}
                alt={movie.title}
                className="movie-image"
              />
              <div className="overlay-badge">
                {movie.age !== "unrated" && <MovieAgeBadge age={movie.age} />}
              </div>
            </div>

            <h3 className="movie-title">{movie.title}</h3>

            {user && user.role === "admin" && (
              <div
                className="admin-controls"
                onClick={(e) => e.stopPropagation()} // ngăn click vào card
              >
                <button
                  className="movie-edit-button"
                  onClick={() => handleEditMovieClick(movie)}
                >
                  <CiEdit />
                </button>
                <button
                  className="movie-delete-button"
                  onClick={() => handleDeleteMovie(movie._id)}
                >
                  <MdRemoveCircleOutline />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddMovie && <AddMovieComponent onClose={toggleAddMovie} />}
      {showEditMovie && (
        <EditMovieComponent onClose={toggleEditMovie} movie={selectedMovie} />
      )}
    </div>
  );
};

export default MoviePage;
