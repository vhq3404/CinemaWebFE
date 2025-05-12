import React, { useState, useEffect, useMemo, useCallback } from "react";
import TheaterGallery from "../../components/TheaterGallery/TheaterGallery";
import AddTheaterComponent from "../../components/AddTheaterComponent/AddTheaterComponent";
import UpdateTheaterComponent from "../../components/UpdateTheaterComponent/UpdateTheaterComponent";
import RoomsManagement from "../../components/RoomsManagement/RoomsManagement";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import "./TheaterPage.css";

const TheaterPage = () => {
  const [theaters, setTheaters] = useState([]);
  const [filteredTheaters, setFilteredTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [showAddTheater, setShowAddTheater] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [loadingTheater, setLoadingTheater] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    district: "",
  });

  // Lấy danh sách các thành phố duy nhất
  const cityOptions = useMemo(() => {
    const cities = new Set();
    theaters.forEach((theater) => {
      if (theater.city) cities.add(theater.city);
    });
    return Array.from(cities);
  }, [theaters]);

  // Lấy danh sách quận/huyện theo thành phố đã chọn
  const districtOptions = useMemo(() => {
    const districts = new Set();
    theaters.forEach((theater) => {
      if (
        (!filters.city || theater.city === filters.city) &&
        theater.district
      ) {
        districts.add(theater.district);
      }
    });
    return Array.from(districts);
  }, [theaters, filters.city]);

  const toggleAddTheater = () => {
    setShowAddTheater(!showAddTheater);
  };

  useEffect(() => {
    const fetchTheaters = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/theaters");
        const data = await response.json();
        setTheaters(data);
        setFilteredTheaters(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách rạp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setFilters({
        city: value,
        district: "",
      });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  // Auto apply filters whenever filters change
  const applyFilters = useCallback(() => {
    const filtered = theaters.filter((theater) => {
      const matchesCity = filters.city ? theater.city === filters.city : true;
      const matchesDistrict = filters.district
        ? theater.district === filters.district
        : true;

      return matchesCity && matchesDistrict;
    });

    setFilteredTheaters(filtered);
  }, [filters, theaters]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handleSelectTheater = (theater) => {
    setLoadingTheater(true);

    setTimeout(() => {
      setSelectedTheater(theater);
      setLoadingTheater(false);
    }, 500);
  };

  const handleDeleteTheater = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá rạp này không?")) {
      try {
        await fetch(`http://localhost:8080/api/theaters/${id}`, {
          method: "DELETE",
        });
        setSelectedTheater(null); // Ẩn chi tiết rạp
        setTheaters((prev) => prev.filter((theater) => theater.id !== id));
      } catch (error) {
        console.error("Lỗi khi xoá rạp:", error);
      }
    }
  };

  return (
    <div className="theater-page">
      <div className="theater-list">
        <h1>Danh Sách Rạp</h1>
        <div className="filters">
          <select
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {cityOptions.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            name="district"
            value={filters.district}
            onChange={handleFilterChange}
            disabled={!filters.city} // Chỉ cho chọn khi đã chọn thành phố
          >
            <option value="">Chọn Quận/Huyện</option>
            {districtOptions.map((district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            ))}
          </select>

          <button className="add-theater-button" onClick={toggleAddTheater}>
            Thêm rạp
          </button>
        </div>

        {loading ? (
          <p className="loading">Đang tải danh sách rạp...</p>
        ) : (
          <div className="theaters-grid">
            {filteredTheaters.map((theater) => (
              <div
                key={theater.id}
                className="theater-card"
                onClick={() => handleSelectTheater(theater)}
              >
                {theater.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {loadingTheater ? (
        <p className="loading">Đang tải thông tin rạp...</p>
      ) : (
        selectedTheater && (
          <>
            <div className="theater-header">
              <div className="theater-name">{selectedTheater.name}</div>

              <div className="admin-theater-actions">
                <button
                  className="update-theater-button"
                  onClick={() => setShowUpdateForm(true)}
                >
                  <MdOutlineEdit />
                </button>
                <button
                  className="delete-theater-button"
                  onClick={() => handleDeleteTheater(selectedTheater.id)}
                >
                  <MdDeleteOutline />
                </button>
              </div>
            </div>

            <TheaterGallery theater={selectedTheater} />
          </>
        )
      )}

      {showUpdateForm && selectedTheater && (
        <UpdateTheaterComponent
          theater={selectedTheater}
          onClose={() => setShowUpdateForm(false)}
        />
      )}

      {showAddTheater && <AddTheaterComponent onClose={toggleAddTheater} />}

      <RoomsManagement theaterId={selectedTheater?.id} />
    </div>
  );
};

export default TheaterPage;
