import React, { useState, useEffect } from "react";
import "./TheaterPage.css";

const TheaterPage = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    district: "",
    brand: "",
    type: "",
    time: "",
    movie: "",
  });

  // Dữ liệu giả
  const mockTheaters = [
    {
      id: 1,
      name: "Rạp CGV Vincom",
      address: "Vincom Center, Quận 1, TP.HCM",
      phone: "0123 456 789",
      brand: "CGV",
      type: "2D",
      movies: ["Avengers", "Spider-Man"],
      times: ["Sáng", "Chiều"],
    },
    {
      id: 2,
      name: "Rạp Lotte Cinema",
      address: "Lotte Mart, Quận 7, TP.HCM",
      phone: "0987 654 321",
      brand: "Lotte",
      type: "3D",
      movies: ["Batman", "Superman"],
      times: ["Chiều", "Tối"],
    },
    {
      id: 3,
      name: "Rạp Galaxy Nguyễn Du",
      address: "Nguyễn Du, Quận 1, TP.HCM",
      phone: "0345 678 910",
      brand: "Galaxy",
      type: "IMAX",
      movies: ["Avatar", "Titanic"],
      times: ["Sáng", "Tối"],
    },
  ];

  const [filteredTheaters, setFilteredTheaters] = useState([]);

  useEffect(() => {
    // Giả lập gọi API
    setTimeout(() => {
      setTheaters(mockTheaters);
      setFilteredTheaters(mockTheaters);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const filtered = theaters.filter((theater) => {
      const matchesCity = filters.city ? theater.address.includes(filters.city) : true;
      const matchesDistrict = filters.district ? theater.address.includes(filters.district) : true;
      const matchesBrand = filters.brand ? theater.brand === filters.brand : true;
      const matchesType = filters.type ? theater.type === filters.type : true;
      const matchesTime = filters.time ? theater.times.includes(filters.time) : true;
      const matchesMovie = filters.movie ? theater.movies.includes(filters.movie) : true;

      return matchesCity && matchesDistrict && matchesBrand && matchesType && matchesTime && matchesMovie;
    });

    setFilteredTheaters(filtered);
  };

  return (
    <div className="theater-page">
      <h1>Danh Sách Rạp</h1>

      {/* Thanh tìm kiếm nhanh
      <div className="search-bar">
        <input type="text" placeholder="Tìm kiếm rạp hoặc phim..." />
        <button>🔍</button>
      </div> */}

      <div className="filters">
        <select name="city" value={filters.city} onChange={handleFilterChange}>
          <option value="">Chọn Tỉnh/Thành phố</option>
          <option value="TP.HCM">TP.HCM</option>
          <option value="Hà Nội">Hà Nội</option>
        </select>
        <select name="district" value={filters.district} onChange={handleFilterChange}>
          <option value="">Chọn Quận/Huyện</option>
          <option value="Quận 1">Quận 1</option>
          <option value="Quận 7">Quận 7</option>
        </select>
        <select name="brand" value={filters.brand} onChange={handleFilterChange}>
          <option value="">Chọn Thương hiệu</option>
          <option value="CGV">CGV</option>
          <option value="Lotte">Lotte</option>
          <option value="Galaxy">Galaxy</option>
        </select>
        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">Chọn Loại rạp</option>
          <option value="2D">2D</option>
          <option value="3D">3D</option>
          <option value="IMAX">IMAX</option>
        </select>
        <select name="time" value={filters.time} onChange={handleFilterChange}>
          <option value="">Chọn Giờ chiếu</option>
          <option value="Sáng">Sáng</option>
          <option value="Chiều">Chiều</option>
          <option value="Tối">Tối</option>
        </select>
        <select name="movie" value={filters.movie} onChange={handleFilterChange}>
          <option value="">Chọn Phim đang chiếu</option>
          <option value="Avengers">Avengers</option>
          <option value="Spider-Man">Spider-Man</option>
          <option value="Batman">Batman</option>
          <option value="Avatar">Avatar</option>
        </select>
        <button onClick={applyFilters}>Lọc rạp</button>
      </div>

      {loading ? (
        <p className="loading">Đang tải danh sách rạp...</p>
      ) : (
        <div className="theaters-grid">
          {filteredTheaters.map((theater) => (
            <div key={theater.id} className="theater-card">
              <h3>{theater.name}</h3>
              <p>Địa chỉ: {theater.address}</p>
              <p>Số điện thoại: {theater.phone}</p>
              <p>Thương hiệu: {theater.brand}</p>
              <p>Loại rạp: {theater.type}</p>
              <div className="theater-actions">
                <button className="view-schedule">Xem lịch chiếu</button>
                <button className="view-map">Xem bản đồ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheaterPage;