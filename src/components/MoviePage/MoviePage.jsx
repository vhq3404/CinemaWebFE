import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CiEdit } from "react-icons/ci";
import { MdRemoveCircleOutline } from "react-icons/md";
import AddMovieComponent from "../AddMovieComponent/AddMovieComponent";
import EditMovieComponent from "../EditMovieComponent/EditMovieComponent";
import MovieAgeBadge from "../MovieAgeBadge/MovieAgeBadge";
import "./MoviePage.css";

const MoviePage = ({
  isVertical = false,
  excludeId = null,
  isAdmin = false,
  isHomePage = false,
}) => {
  const [activeTab, setActiveTab] = useState("now_showing");
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showEditMovie, setShowEditMovie] = useState(false);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showAllMovies, setShowAllMovies] = useState(false);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/movies?status=${activeTab}`
        );
        const data = await res.json();

        let sortedData = [...data];

        if (excludeId) {
          sortedData = sortedData.filter((movie) => movie._id !== excludeId);
        }

        if (activeTab === "now_showing") {
          sortedData.sort(
            (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
          );
        } else if (activeTab === "coming_soon") {
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
    setSelectedMovie(movie);
    toggleEditMovie();
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowAllMovies(false); // reset khi đổi tab
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này không?")) {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/movies/${movieId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          setMovies((prev) => prev.filter((movie) => movie._id !== movieId));
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

  const displayedMovies = isVertical
    ? movies.slice(0, 3)
    : isHomePage && !showAllMovies
    ? movies.slice(0, 8)
    : movies;

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
        {isAdmin && !isVertical && (
          <button onClick={toggleAddMovie} className="add-movie-button">
            Thêm phim
          </button>
        )}
      </div>

      <div className={`movies-grid ${isVertical ? "vertical" : ""}`}>
        {displayedMovies.map((movie) => (
          <div
            key={movie._id}
            className="movie-card"
            onClick={() => handleMovieClick(movie._id)}
          >
            <div className="movie-poster">
              <img
                src={`${process.env.REACT_APP_API_URL}/movies/${movie.poster}`}
                alt={movie.title}
                className="movie-image"
              />
              <div className="overlay-badge">
                {movie.age !== "unrated" && <MovieAgeBadge age={movie.age} />}
              </div>
            </div>

            <h3 className="movie-title">{movie.title}</h3>

            {isAdmin && (
              <div
                className="admin-controls"
                onClick={(e) => e.stopPropagation()}
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

      {/* Nút "Xem thêm" nếu là trang chủ và chưa hiển thị hết */}
      {isHomePage && movies.length > 8 && !showAllMovies && (
        <div className="see-more-container">
          <button
            className="see-more-button"
            onClick={() => setShowAllMovies(true)}
          >
            Xem thêm
          </button>
        </div>
      )}

      {showAddMovie && <AddMovieComponent onClose={toggleAddMovie} />}
      {showEditMovie && (
        <EditMovieComponent onClose={toggleEditMovie} movie={selectedMovie} />
      )}
    </div>
  );
};

export default MoviePage;
