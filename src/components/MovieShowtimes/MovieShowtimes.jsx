import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DateFilter from "../../components/DateFilter/DateFilter";
import AuthModal from "../../components/AuthModal/AuthModal";
import "./MovieShowtimes.css";

const MovieShowtimes = ({ movieId }) => {
  const [showtimesByTheater, setShowtimesByTheater] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingShowtime, setPendingShowtime] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState("Tất cả");
  const [theaterOptions, setTheaterOptions] = useState([]);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [cityOptions, setCityOptions] = useState(["Tất cả"]);
  const [selectedCity, setSelectedCity] = useState("Tất cả");
  const [theaterList, setTheaterList] = useState([]);
  useEffect(() => {
    const fetchShowtimesAndTheaters = async () => {
      setLoading(true);
      try {
        // 1. Fetch showtimes
        const showtimeRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/showtimes?movieId=${movieId}`
        );
        const showtimeData = await showtimeRes.json();

        if (!showtimeRes.ok)
          throw new Error(showtimeData.error || "Lỗi dữ liệu suất chiếu");

        // 2. Fetch all theaters (for mapping city)
        const theaterRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/theaters`
        );
        const theaterData = await theaterRes.json();
        console.log("Fetched theaters:", theaterData);

        if (!theaterRes.ok)
          throw new Error(theaterData.error || "Lỗi dữ liệu rạp");

        setTheaterList(theaterData || []);

        const now = new Date();
        const groupedByDate = {};
        const theaterSet = new Set();

        for (const showtime of showtimeData.showtimes) {
          const showtimeDateStr = showtime.date.slice(0, 10);
          const startTime = new Date(showtime.startTime);

          if (startTime > now) {
            const theaterName = showtime.theater.theaterName;
            theaterSet.add(theaterName);

            if (!groupedByDate[showtimeDateStr])
              groupedByDate[showtimeDateStr] = {};
            if (!groupedByDate[showtimeDateStr][theaterName])
              groupedByDate[showtimeDateStr][theaterName] = [];

            groupedByDate[showtimeDateStr][theaterName].push(showtime);
          }
        }

        // Lấy ngày và thành phố
        const dates = Object.keys(groupedByDate).sort(
          (a, b) => new Date(a) - new Date(b)
        );
        const cities = new Set();
        Array.from(theaterSet).forEach((theaterName) => {
          const theater = theaterData.find((t) => t.name === theaterName);
          if (theater && theater.city) cities.add(theater.city);
        });

        setAvailableDates(dates);
        setSelectedDate(dates[0] || "");
        setShowtimesByTheater(groupedByDate);
        setTheaterOptions(["Tất cả", ...Array.from(theaterSet)]);
        setCityOptions(["Tất cả", ...Array.from(cities)]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimesAndTheaters();
  }, [movieId]);

  useEffect(() => {
    if (selectedCity === "Tất cả") {
      // Lấy tất cả tên rạp có trong showtimes
      const allTheaterNames = new Set(
        Object.values(showtimesByTheater).flatMap((theaterGroup) =>
          Object.keys(theaterGroup)
        )
      );
      setTheaterOptions(["Tất cả", ...Array.from(allTheaterNames)]);
    } else {
      // Lọc các rạp thuộc thành phố được chọn
      const filteredTheaters = theaterList
        .filter((t) => t.city === selectedCity)
        .map((t) => t.name)
        .filter((name) =>
          // Chỉ lấy các rạp có suất chiếu trong dữ liệu
          Object.values(showtimesByTheater).some((group) =>
            Object.keys(group).includes(name)
          )
        );

      setTheaterOptions(["Tất cả", ...filteredTheaters]);
    }

    // Reset lại selectedTheater nếu nó không còn hợp lệ
    setSelectedTheater("Tất cả");
  }, [selectedCity, showtimesByTheater, theaterList]);

  const handleShowtimeClick = (showtime) => {
    if (user) {
      navigate("/booking", { state: { showtime } });
    } else {
      setPendingShowtime(showtime);
      setShowLoginModal(true);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  return (
    <div>
      <div className="movie-showtimes-page">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            <label>Lịch chiếu</label>
            {availableDates.length > 0 ? (
              <>
                <DateFilter
                  showtimes={availableDates}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
                <div className="filter-container">
                  <div className="filter-group">
                    <h3>Chọn Tỉnh/Thành phố:</h3>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      {cityOptions.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <h3>Chọn rạp:</h3>
                    <select
                      value={selectedTheater}
                      onChange={(e) => setSelectedTheater(e.target.value)}
                    >
                      {theaterOptions.map((theater, idx) => (
                        <option key={idx} value={theater}>
                          {theater}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="schedule-divider" />
                <div className="showtimes-table-structured">
                  {Object.entries(showtimesByTheater[selectedDate] || {})
                    .filter(([theaterName]) => {
                      const theater = theaterList.find(
                        (t) => t.name.trim() === theaterName.trim()
                      );

                      const matchesCity =
                        selectedCity === "Tất cả" ||
                        theater?.city === selectedCity;

                      const matchesTheater =
                        selectedTheater === "Tất cả" ||
                        theaterName.trim() === selectedTheater.trim();

                      return matchesCity && matchesTheater;
                    })

                    .map(([theaterName, showtimes], index) => {
                      const groupedByType = showtimes.reduce(
                        (acc, showtime) => {
                          const type = showtime.showtimeType || "Khác";
                          if (!acc[type]) acc[type] = [];
                          acc[type].push(showtime);
                          return acc;
                        },
                        {}
                      );

                      const typeEntries = Object.entries(groupedByType);

                      return (
                        <div key={index} className="theater-group">
                          {typeEntries.map(([type, times], i) => (
                            <div
                              key={`${index}-${i}`}
                              className="showtimes-row"
                            >
                              <div className="theater-name-cell">
                                {i === 0 ? theaterName : ""}
                              </div>
                              <div className="format-type-cell">{type}</div>
                              <div className="showtime-badges-cell">
                                {times.map((showtime, idx) => (
                                  <span
                                    key={idx}
                                    className="showtime-badge"
                                    onClick={() =>
                                      handleShowtimeClick(showtime)
                                    }
                                  >
                                    {formatTime(showtime.startTime)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <p>Chưa có lịch chiếu.</p>
            )}
          </>
        )}
      </div>
      {showLoginModal && (
        <AuthModal
          onClose={() => setShowLoginModal(false)}
          showtime={pendingShowtime}
          navigateAfterLogin={navigate}
        />
      )}
    </div>
  );
};

export default MovieShowtimes;
