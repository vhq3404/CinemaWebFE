import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddTheaterComponent.css";

const AddTheaterComponent = ({ onClose }) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [address, setAddress] = useState("");
  const [hotline, setHotline] = useState("");
  const [status, setStatus] = useState("");
  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedCity = provinces.find((p) => p.id === city)?.name || "";
  
  console.log("city", city);

  useEffect(() => {
    axios
      .get("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((res) => {
        if (res.data?.error === 0 && Array.isArray(res.data?.data)) {
          setProvinces(res.data.data);
        } else {
          console.error("Lỗi dữ liệu:", res.data?.error_text);
        }
      })
      .catch((err) => console.error("Fetch lỗi:", err));
  }, []);

  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setDistrict("");
      return;
    }

    axios
      .get(`https://esgoo.net/api-tinhthanh/2/${city}.htm`)
      .then((res) => {
        if (res.data?.error === 0 && Array.isArray(res.data?.data)) {
          setDistricts(res.data.data);
        } else {
          console.error("Lỗi dữ liệu quận/huyện:", res.data?.error_text);
          setDistricts([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy quận/huyện:", err);
        setDistricts([]);
      });
  }, [city]);

  const handleImageChange = (e) => {
    setGallery([...gallery, ...Array.from(e.target.files)]);
  };

  const removeImage = (index) => {
    const updatedGallery = [...gallery];
    updatedGallery.splice(index, 1);
    setGallery(updatedGallery);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();

      const theaterData = {
        name,
        city: selectedCity,
        district,
        address,
        hotline,
        status: status === "close" ? "close" : "open",
      };

      formData.append("data", JSON.stringify(theaterData));

      // Đính kèm ảnh
      gallery.forEach((file) => {
        formData.append("gallery", file);
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/theaters`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Thêm thành công:", result);
        window.location.reload();
        onClose();
      } else {
        console.error("Lỗi từ server:", result.error);
      }
    } catch (err) {
      console.error("Lỗi thêm rạp:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-theater-overlay">
      <div className="add-theater-form">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Thêm rạp</h2>
        <div className="theater-form-content">
          <form onSubmit={handleSubmit} className="theater-form-fields">
            <div>
              <label>
                <span className="required">*</span> Tên rạp:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-column">
              <div>
                <label>
                  <span className="required">*</span> Tỉnh / Thành phố:
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  <span className="required">*</span> Quận / Huyện:
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  disabled={!districts.length}
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phần còn lại giữ nguyên */}
            <div>
              <label>
                <span className="required">*</span> Địa chỉ:
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="input-column">
              <div>
                <label>
                  <span className="required">*</span> Hotline:
                </label>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Trạng thái:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">Mở cửa</option>
                  <option value="close">Đóng cửa</option>
                </select>
              </div>
            </div>

            <div>
              <label>Thêm ảnh:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <div className="gallery-preview">
                {gallery.map((file, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="gallery-thumbnail"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-gallery-btn"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="btn-column">
              <button onClick={onClose} className="cancel-add-theater-button">
                Hủy
              </button>
              <button
                type="submit"
                className="submit-add-theater-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang thêm..." : "Thêm rạp"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTheaterComponent;
