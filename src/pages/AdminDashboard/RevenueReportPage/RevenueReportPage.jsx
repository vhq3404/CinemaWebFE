import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RevenueReportPage.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const RevenueReportPage = () => {
  const [bookings, setBookings] = useState([]);
  const [foodBookings, setFoodBookings] = useState([]); // thêm state đồ ăn
  const [movies, setMovies] = useState([]);
  const [foodItemRevenueMap, setFoodItemRevenueMap] = useState({});

  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());

  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filteredFoodBookings, setFilteredFoodBookings] = useState([]);
  const [foodChartDataByItem, setFoodChartDataByItem] = useState([]);

  useEffect(() => {
    const prepareFoodChartDataByItem = async () => {
      const dateMap = {};
      const allFoodNames = new Set();

      for (const fb of filteredFoodBookings) {
        const dateStr = fb.created_at.split("T")[0];

        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/food-bookings/${fb.id}/items`
          );
          const items = res.data.items;

          if (!dateMap[dateStr]) {
            dateMap[dateStr] = {};
          }

          const uniqueNamesInBooking = new Set(
            items.map((item) => item.food_name)
          );
          uniqueNamesInBooking.forEach((name) => {
            allFoodNames.add(name);
            if (!dateMap[dateStr][name]) {
              dateMap[dateStr][name] = 0;
            }
            dateMap[dateStr][name] += Number(fb.total_price);
          });
        } catch (err) {
          console.error(`Lỗi khi lấy items của booking ${fb.id}`, err);
        }
      }

      const dateRange = getDateRange(startDate, endDate);

      // Bước 1: tạo chartData thô
      let rawChartData = dateRange.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        const dataForDay = { date: dateStr };

        allFoodNames.forEach((foodName) => {
          dataForDay[foodName] = dateMap[dateStr]?.[foodName] || null;
        });

        return dataForDay;
      });

      allFoodNames.forEach((foodName) => {
        for (let i = 1; i < rawChartData.length - 1; i++) {
          const prev = rawChartData[i - 1][foodName];
          const current = rawChartData[i][foodName];
          const next = rawChartData[i + 1][foodName];

          if (
            current === null &&
            prev !== null &&
            prev > 0 &&
            next !== null &&
            next > 0
          ) {
            rawChartData[i][foodName] = 0;
          }
        }
      });

      setFoodChartDataByItem(rawChartData);
    };

    if (filteredFoodBookings.length > 0) {
      prepareFoodChartDataByItem();
    } else {
      setFoodChartDataByItem([]);
    }
  }, [filteredFoodBookings, startDate, endDate]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings`
        );
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    const fetchFoodBookings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/food-bookings`
        );
        setFoodBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch food bookings:", err);
      }
    };

    const fetchMovies = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/movies`
        );
        setMovies(res.data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };

    fetchBookings();
    fetchFoodBookings(); // gọi thêm đồ ăn
    fetchMovies();
  }, []);

  // Lọc theo ngày & status cho bookings phim
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);

      const filtered = bookings.filter((booking) => {
        const createdAt = new Date(booking.created_at);
        return (
          createdAt >= start && createdAt < end && booking.status === "PAID"
        );
      });

      setFilteredBookings(filtered);

      // Lọc đồ ăn theo ngày & status tương tự
      const filteredFood = foodBookings.filter((fb) => {
        const createdAt = new Date(fb.created_at);
        return createdAt >= start && createdAt < end && fb.status === "PAID";
      });

      setFilteredFoodBookings(filteredFood);
    } else {
      setFilteredBookings([]);
      setFilteredFoodBookings([]);
    }
  }, [startDate, endDate, bookings, foodBookings]);

  useEffect(() => {
    const fetchFoodItemRevenue = async () => {
      const map = {};

      for (const fb of filteredFoodBookings) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/food-bookings/${fb.id}/items`
          );
          const items = res.data.items;

          // Lấy danh sách món ăn trong booking này, duyệt từng món 1 lần thôi
          const foodNamesInBooking = new Set(
            items.map((item) => item.food_name)
          );

          foodNamesInBooking.forEach((name) => {
            if (!map[name]) {
              map[name] = 0;
            }
            // Cộng tổng price của booking cho từng món
            map[name] += Number(fb.total_price);
          });
        } catch (err) {
          console.error(`Lỗi khi lấy items của booking ${fb.id}`, err);
        }
      }

      setFoodItemRevenueMap(map);
    };

    if (filteredFoodBookings.length > 0) {
      fetchFoodItemRevenue();
    } else {
      setFoodItemRevenueMap({});
    }
  }, [filteredFoodBookings]);

  // Tổng doanh thu phim
  const totalRevenue = filteredBookings.reduce(
    (sum, booking) => sum + Number(booking.total_price),
    0
  );

  // Tổng doanh thu đồ ăn
  const totalFoodRevenue = filteredFoodBookings.reduce(
    (sum, fb) => sum + Number(fb.total_price),
    0
  );

  // Tính doanh thu theo từng phim
  const movieRevenueMap = {};
  filteredBookings.forEach((booking) => {
    const movieId = booking.movie_id;
    if (!movieRevenueMap[movieId]) movieRevenueMap[movieId] = 0;
    movieRevenueMap[movieId] += Number(booking.total_price);
  });

  // Tạo mảng ngày từ start đến end
  const getDateRange = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const result = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      result.push(new Date(d));
    }
    return result;
  };

  let rawChartData = getDateRange(startDate, endDate).map((date) => {
    const dayStr = date.toISOString().split("T")[0];
    const dataForDay = { date: dayStr };

    movies.forEach((movie) => {
      dataForDay[movie.title] = null;
    });

    filteredBookings.forEach((booking) => {
      const bookingDateStr = booking.created_at.split("T")[0];
      if (bookingDateStr === dayStr) {
        const movie = movies.find((m) => m._id === booking.movie_id);
        if (movie) {
          if (dataForDay[movie.title] === null) {
            dataForDay[movie.title] = Number(booking.total_price);
          } else {
            dataForDay[movie.title] += Number(booking.total_price);
          }
        }
      }
    });

    return dataForDay;
  });

  // Nối từ 0 đến ngày đầu tiên có doanh thu
  movies.forEach((movie) => {
    const firstWithRevenueIndex = rawChartData.findIndex(
      (d) => d[movie.title] !== null && d[movie.title] > 0
    );
    if (firstWithRevenueIndex > 0) {
      // Chỉ chèn nếu startDate không có doanh thu
      const prev = rawChartData[firstWithRevenueIndex - 1];
      if (prev[movie.title] === null) {
        prev[movie.title] = 0;
      }
    }
  });

  // Chèn 0 vào các khoảng hở giữa hai ngày có doanh thu
  movies.forEach((movie) => {
    for (let i = 1; i < rawChartData.length - 1; i++) {
      const prev = rawChartData[i - 1][movie.title];
      const current = rawChartData[i][movie.title];
      const next = rawChartData[i + 1][movie.title];

      if (
        current === null &&
        prev !== null &&
        prev > 0 &&
        next !== null &&
        next > 0
      ) {
        rawChartData[i][movie.title] = 0;
      }
    }
  });

  const chartData = rawChartData;

  const availableMonths = (() => {
    const monthSet = new Set();

    bookings.forEach((booking) => {
      const date = new Date(booking.created_at);
      if (!isNaN(date)) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        monthSet.add(`${year}-${month}`);
      }
    });

    // Sắp xếp mới nhất lên đầu
    return Array.from(monthSet).sort((a, b) => (a < b ? 1 : -1));
  })();

  const formatCurrency = (number) =>
    number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="revenue-container">
      <h2>Báo cáo doanh thu </h2>

      <div className="revenue-controls">
        <label className="revenue-label">
          Chọn tháng:
          <select
            className="revenue-select"
            onChange={(e) => {
              if (!e.target.value) return;
              const [year, month] = e.target.value.split("-");
              const start = new Date(Number(year), Number(month) - 1, 1);
              const end = new Date(Number(year), Number(month), 0);

              setStartDate(start.toISOString().split("T")[0]);
              setEndDate(end.toISOString().split("T")[0]);
            }}
            defaultValue=""
          >
            <option value="">-- Chọn tháng --</option>
            {availableMonths.map((monthStr) => {
              const [year, month] = monthStr.split("-");
              return (
                <option key={monthStr} value={monthStr}>
                  Tháng {Number(month)}/{year}
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="revenue-date-controls">
        <label className="revenue-date-label">
          Từ ngày:
          <input
            className="revenue-date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label className="revenue-date-label">
          Đến ngày:
          <input
            className="revenue-date-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="revenue-cards">
        <div className="revenue-card total-revenue-card">
          <h4>Tổng doanh thu</h4>
          <p>{formatCurrency(totalRevenue + totalFoodRevenue)}</p>
        </div>
        <div className="revenue-card movie-revenue-card">
          <h4>Tổng doanh thu phim</h4>
          <p>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="revenue-card food-revenue-card">
          <h4>Tổng doanh thu đồ ăn</h4>
          <p style={{ color: "orange" }}>{formatCurrency(totalFoodRevenue)}</p>
        </div>
      </div>

      <h4 className="revenue-subtitle">Biểu đồ doanh thu theo từng phim</h4>
      <div className="revenue-chart-wrapper">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {movies.map((movie) =>
              chartData.some((d) => d[movie.title]) ? (
                <Line
                  key={movie._id}
                  type="linear"
                  dataKey={movie.title}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(
                    16
                  )}`}
                  strokeWidth={2}
                  dot={false}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h4 className="revenue-subtitle">Doanh thu theo từng phim</h4>
      <table className="revenue-table">
        <thead>
          <tr>
            <th>Tên phim</th>
            <th>Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {movies
            .map((movie) => ({
              ...movie,
              revenue: movieRevenueMap[movie._id] || 0,
            }))
            .filter((movie) => movie.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue)
            .map((movie) => (
              <tr key={movie._id}>
                <td>{movie.title}</td>
                <td>{formatCurrency(movie.revenue)}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <h4 className="revenue-subtitle">
        Biểu đồ doanh thu đồ ăn theo từng món
      </h4>
      <div className="revenue-chart-wrapper">
        <ResponsiveContainer>
          <LineChart data={foodChartDataByItem}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {foodChartDataByItem.length > 0 &&
              Object.keys(foodChartDataByItem[0])
                .filter((key) => key !== "date")
                .map((foodName, index) => (
                  <Line
                    key={foodName}
                    type="linear"
                    dataKey={foodName}
                    stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h4 className="revenue-subtitle">Doanh thu theo từng món ăn</h4>
      <table className="revenue-table">
        <thead>
          <tr>
            <th>Món ăn</th>
            <th>Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(foodItemRevenueMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, revenue]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{formatCurrency(revenue)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default RevenueReportPage;
