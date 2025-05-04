// File: LoginComponent.jsx
import React, { useState, useRef } from "react";
import "./AddMovieComponent.css";
import { FaRegTrashAlt, FaRegCalendarAlt } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";

const AddMovieComponent = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [director, setDirector] = useState("");
  const [nation, setNation] = useState("");
  const [duration, setDuration] = useState("");
  const [age, setAge] = useState("");
  const [trailer, setTrailer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [rawDate, setRawDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const hiddenDateRef = useRef();

  const [newActor, setNewActor] = useState("");
  const [actorList, setActorList] = useState([]);
  const [actorError, setActorError] = useState("");
  const [genreError, setGenreError] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [genreList, setGenreList] = useState([]);

  const handleAddActor = () => {
    if (newActor.trim() !== "") {
      setActorList([...actorList, newActor.trim()]);
      setNewActor("");
      setActorError("");
    }
  };

  const handleRemoveActor = (index) => {
    const updatedList = actorList.filter((_, i) => i !== index);
    setActorList(updatedList);
  };

  const handleAddGenre = () => {
    if (newGenre.trim() !== "") {
      setGenreList([...genreList, newGenre.trim()]);
      setNewGenre("");
      setGenreError("");
    }
  };

  const handleRemoveGenre = (index) => {
    const updatedList = genreList.filter((_, i) => i !== index);
    setGenreList(updatedList);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file)); // Hiển thị preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasActor = actorList.some((actor) => actor.trim() !== "");
    if (!hasActor) {
      setActorError("Vui lòng thêm ít nhất 1 diễn viên.");
      return;
    } else {
      setActorError(""); // Xóa lỗi nếu hợp lệ
    }

    setIsLoading(true);

    const hasGenre = genreList.some((genre) => genre.trim() !== "");
    if (!hasGenre) {
      setGenreError("Vui lòng thêm ít nhất 1 thể loại.");
      return;
    } else {
      setGenreError(""); // Xóa lỗi nếu hợp lệ
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      const movieData = {
        title,
        description,
        status: status === "now_showing" ? "now_showing" : "coming_soon",
        director,
        actors: actorList,  
        genres: genreList,
        nation,
        duration,
        age: age?.trim() || "unrated",
        trailer,
        releaseDate: rawDate,
      };

      formData.append("data", JSON.stringify(movieData));
      if (posterFile) {
        formData.append("poster", posterFile);
      }

      const response = await fetch("http://localhost:8080/api/movies", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Thêm thành công:", result);
        window.location.reload();
        onClose();
      } else {
        console.error("Lỗi từ server:", result.error);
      }
    } catch (err) {
      console.error("Lỗi thêm phim:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setRawDate(date);
    const [year, month, day] = date.split("-");
    if (year && month && day) {
      setFormattedDate(`${day}/${month}/${year}`);
    }
  };

  const openDatePicker = () => {
    hiddenDateRef.current.showPicker?.();
  };

  return (
    <div className="add-movie-overlay">
      <div className="add-movie-form">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Thêm phim mới</h2>
        <div className="form-content">
          {/* Cột trái - Poster Preview */}
          <div className="poster-preview">
            {posterPreview ? (
              <img src={posterPreview} alt="Poster Preview" />
            ) : (
              <div className="poster-placeholder">Chưa chọn ảnh</div>
            )}

            <label className="custom-file-upload">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              Chọn ảnh poster
            </label>
            <div className="trailer-link">
              <label>Thêm trailer link:</label>
              <input
                type="text"
                value={trailer}
                onChange={(e) => setTrailer(e.target.value)}
              />
            </div>

            <div className="input-column">
              <div>
                <label>Giới hạn tuổi:</label>
                <select value={age} onChange={(e) => setAge(e.target.value)}>
                  <option value="unrated">Chưa chọn</option>
                  <option value="P">P</option>
                  <option value="T13">T13</option>
                  <option value="T16">T16</option>
                  <option value="T18">T18</option>
                </select>
              </div>

              <div>
                <label>Trạng thái:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="coming_soon">Sắp chiếu</option>
                  <option value="now_showing">Đang chiếu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cột phải - Form */}
          <form onSubmit={handleSubmit} className="form-fields">
            <div>
              <label>
                <span className="required">*</span>
                Tiêu đề phim:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-column">
              <div>
                <label>
                  <span className="required">*</span>
                  Ngày chiếu:
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={formattedDate}
                    readOnly
                    onClick={openDatePicker}
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                  <span
                    onClick={openDatePicker}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#888",
                    }}
                  >
                    <FaRegCalendarAlt />
                  </span>
                </div>
              </div>

              <input
                type="date"
                ref={hiddenDateRef}
                value={rawDate}
                onChange={handleDateChange}
                required
                style={{
                  opacity: 0,
                  position: "absolute",
                  pointerEvents: "none",
                }}
              />
              <div>
                <label>Thời lượng (phút):</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="input-column">
              <div>
                <label>
                  <span className="required">*</span>
                  Đạo diễn:
                </label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>
                  <span className="required">*</span>
                  Quốc gia:
                </label>
                <input
                  type="text"
                  value={nation}
                  onChange={(e) => setNation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="actor-input-wrapper">
              <label>
                <span className="required">*</span>
                Diễn viên:
              </label>
              <div className="actor-input-group">
                <input
                  type="text"
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  placeholder="Nhập tên diễn viên"
                />
                <button
                  type="button"
                  onClick={handleAddActor}
                  className="add-actor-button"
                >
                  <FiPlus />
                </button>
              </div>
              <ul className="actor-list">
                {actorList.map((actor, index) => (
                  <li key={index}>
                    {actor}
                    <button
                      type="button"
                      onClick={() => handleRemoveActor(index)}
                      className="remove-actor-button"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
              {actorError && <p className="form-error">{actorError}</p>}
              <div className="actor-input-wrapper">
                <label>
                  <span className="required">*</span>
                  Thể loại:
                </label>
                <div className="actor-input-group">
                  <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Nhập thể loại"
                  />
                  <button
                    type="button"
                    onClick={handleAddGenre}
                    className="add-actor-button"
                  >
                    <FiPlus />
                  </button>
                </div>
                <ul className="actor-list">
                  {genreList.map((genre, index) => (
                    <li key={index}>
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(index)}
                        className="remove-actor-button"
                      >
                        <FaRegTrashAlt />
                      </button>
                    </li>
                  ))}
                </ul>
                {genreError && <p className="form-error">{genreError}</p>}
              </div>
            </div>

            <div>
              <label>Giới thiệu phim:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="btn-column">
              <button onClick={onClose} className="cancel-add-movie-button">
                Hủy
              </button>
              <button
                type="submit"
                className="submit-add-movie-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang thêm..." : "Thêm phim"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMovieComponent;
