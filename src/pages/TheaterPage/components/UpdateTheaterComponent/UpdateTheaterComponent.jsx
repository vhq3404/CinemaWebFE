import React, { useState, useEffect } from "react";
import "./UpdateTheaterComponent.css"; // dùng lại style cũ

const UpdateTheaterComponent = ({ onClose, theater }) => {
  const [name, setName] = useState(theater.name || "");
  const [city, setCity] = useState(theater.city || "");
  const [district, setDistrict] = useState(theater.district || "");
  const [address, setAddress] = useState(theater.address || "");
  const [hotline, setHotline] = useState(theater.hotline || "");
  const [status, setStatus] = useState(theater.status || "open");
  const [gallery, setGallery] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/theaters/${theater.id}/gallery`
        );
        const data = await response.json();
        // Giả sử dữ liệu trả về là một mảng các URL ảnh
        const existingImages = data.map((img) => ({
          url: `${process.env.REACT_APP_API_URL}/theaters${img.image_url}`,
          isOld: true, // Đánh dấu ảnh cũ
        }));
        setGallery(existingImages);
      } catch (err) {
        console.error("Lỗi tải ảnh cũ:", err);
      }
    };

    if (theater?.id) {
      fetchExistingImages();
    }
  }, [theater?.id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isOld: false, // Đánh dấu là ảnh mới
    }));
    setGallery((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    const updatedGallery = [...gallery];
    const itemToRemove = updatedGallery[index];

    // Đánh dấu ảnh cũ là đã xóa thay vì xóa luôn
    if (itemToRemove.isOld) {
      updatedGallery[index].isDeleted = true;
    } else {
      updatedGallery.splice(index, 1); // Xóa ảnh mới khỏi mảng
    }

    setGallery(updatedGallery);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      const theaterData = {
        id: theater.id,
        name,
        city,
        district,
        address,
        hotline,
        status,
        deletedImages: gallery
          .filter((img) => img.isOld && img.isDeleted) // Chỉ lấy ảnh cũ và đã bị xóa
          .map((img) => img.url), // Mảng URL của ảnh cần xóa
      };

      console.log(
        "Deleted Images:",
        gallery
          .filter((img) => img.isOld && img.isDeleted) // Xem lại các ảnh bị xóa
          .map((img) => img.url)
      );

      formData.append("data", JSON.stringify(theaterData));

      // Thêm ảnh mới vào formData
      gallery.forEach((item) => {
        if (!item.isOld && item.file) {
          formData.append("gallery", item.file);
        }
      });

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/theaters/${theater.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok) {
        console.log("Cập nhật thành công:", result);
        window.location.reload();
        onClose();
      } else {
        console.error("Lỗi từ server:", result.error);
      }
    } catch (err) {
      console.error("Lỗi cập nhật rạp:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="update-theater-overlay">
      <div className="update-theater-form">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Chỉnh sửa rạp</h2>
        <div className="theater-form-content">
          <form onSubmit={handleSubmit} className="theater-form-fields">
            <div>
              <label>
                <span className="required">*</span>Tên rạp:
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
                  <span className="required">*</span>Tỉnh / Thành phố:
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>
                  <span className="required">*</span>Quận / Huyện:
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label>
                <span className="required">*</span>Địa chỉ:
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
                  <span className="required">*</span>Hotline:
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
              <label>Thêm ảnh mới:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
              <div className="gallery-preview">
                {gallery.map((item, index) => (
                  <div
                    className={`gallery-item ${
                      item.isDeleted ? "deleted" : ""
                    }`}
                    key={index}
                  >
                    <img
                      src={item.isOld ? item.url : item.preview} // Hiển thị ảnh đã xóa hay chưa
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
              <button
                onClick={onClose}
                className="cancel-update-theater-button"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="submit-update-theater-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateTheaterComponent;
