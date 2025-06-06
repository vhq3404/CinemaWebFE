import React, { useEffect, useState } from "react";
import TicketDetails from "./TicketDetails";
import socket from "../../../socket";
import "./BookingManagement.css";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState({});
  const [showtimes, setShowtimes] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("REFUND_REQUESTED");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [searchMovie, setSearchMovie] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [filterTheater, setFilterTheater] = useState("");
  const [filterShowtime, setFilterShowtime] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [filterDate, setFilterDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch theaters
        const resTheaters = await fetch(
          `${process.env.REACT_APP_API_URL}/api/theaters`
        );
        const theaterList = await resTheaters.json();
        setTheaters(theaterList);

        // Fetch bookings
        const resBookings = await fetch(
          `${process.env.REACT_APP_API_URL}/api/bookings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resBookings.ok) throw new Error("Lỗi khi tải booking");
        const bookingData = await resBookings.json();

        setBookings(bookingData || []);

        // Get unique movie, showtime, and user IDs
        // const movieIds = [...new Set(bookingData.map((b) => b.movie_id))];
        // const showtimeIds = [...new Set(bookingData.map((b) => b.showtime_id))];
        const userIds = [...new Set(bookingData.map((b) => b.user_id))];

        // Fetch movies
        const resMovies = await fetch(
          `${process.env.REACT_APP_API_URL}/api/movies`
        );
        const movieList = await resMovies.json();
        const movieMap = {};
        movieList.forEach((m) => (movieMap[m._id] = m.title));
        setMovies(movieMap);

        const resShowtimes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/showtimes`
        );
        const showtimeRes = await resShowtimes.json();

        // Đây là mảng thật sự bạn cần
        const showtimeList = showtimeRes.showtimes || [];

        // Bây giờ có thể forEach được
        const showtimeMap = {};
        showtimeList.forEach((s) => {
          showtimeMap[s._id] = s;
        });
        setShowtimes(showtimeMap);

        // Fetch users by ID
        const userMap = {};
        await Promise.all(
          userIds.map(async (id) => {
            const resUser = await fetch(
              `${process.env.REACT_APP_API_URL}/api/users/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (resUser.ok) {
              const u = await resUser.json();
              userMap[id] = u.name || u.email || `User ${id}`;
            }
          })
        );
        setUsers(userMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleRefundRequested = async (data) => {
      const exists = bookings.some((b) => b.id === data.bookingId);
      if (exists) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === data.bookingId ? { ...b, status: "REFUND_REQUESTED" } : b
          )
        );
      } else {
        // Gọi API lấy booking mới
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/bookings/${data.bookingId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error("Không tìm thấy booking mới");
          const newBooking = await res.json();

          setBookings((prev) => [newBooking, ...prev]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    socket.on("booking_refund_requested", handleRefundRequested);

    return () => {
      socket.off("booking_refund_requested", handleRefundRequested);
    };
  }, []);

  useEffect(() => {
    const handleRefundCancelled = async (data) => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/bookings/${data.bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Không tìm thấy booking sau khi hủy");

        const updatedBooking = await res.json();

        setBookings((prev) =>
          prev.map((b) =>
            b.id.toString() === updatedBooking.id.toString()
              ? updatedBooking
              : b
          )
        );
      } catch (error) {
        console.error("Lỗi khi cập nhật sau hủy yêu cầu hoàn tiền:", error);
      }
    };

    socket.on("booking_refund_cancelled", handleRefundCancelled);

    return () => {
      socket.off("booking_refund_cancelled", handleRefundCancelled);
    };
  }, []);

  const filtered = bookings.filter((b) => {
    if (b.status !== activeTab) return false;

    const movieTitle = movies[b.movie_id] || "";
    const userName = users[b.user_id] || "";

    const matchMovie =
      !searchMovie || normalize(movieTitle).includes(normalize(searchMovie));
    const matchUser =
      !searchUser || normalize(userName).includes(normalize(searchUser));

    const matchTheater =
      !filterTheater ||
      showtimes[b.showtime_id]?.theater.theaterName === filterTheater;

    const matchShowtime = !filterShowtime || b.showtime_id === filterShowtime;

    const matchDate = filterDate
      ? new Date(b.created_at).toDateString() ===
        new Date(filterDate).toDateString()
      : true;

    return (
      matchMovie && matchUser && matchTheater && matchShowtime && matchDate
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedBookings = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="booking-management">
      <h2>Quản lý Vé</h2>

      <div className="booking-tabs">
        {["REFUND_REQUESTED", "PAID", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`booking-tab-button ${
              activeTab === tab ? "active" : ""
            }`}
          >
            {tab === "REFUND_REQUESTED" && "Yêu cầu hoàn tiền"}
            {tab === "PAID" && "Đã thanh toán"}
            {tab === "CANCELLED" && "Đã hủy"}
          </button>
        ))}
      </div>

      <div className="booking-filters">
        <input
          type="text"
          placeholder="Tìm tên khách hàng"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tìm tên phim"
          value={searchMovie}
          onChange={(e) => setSearchMovie(e.target.value)}
        />

        <select
          value={filterTheater}
          onChange={(e) => setFilterTheater(e.target.value)}
        >
          <option value="">Tất cả rạp</option>
          {theaters.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={filterShowtime}
          onChange={(e) => setFilterShowtime(e.target.value)}
        >
          <option value="">Tất cả suất chiếu</option>
          {Object.values(showtimes).map((s) => (
            <option key={s._id} value={s._id}>
              {new Date(s.startTime).toLocaleString("vi-VN")}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <table className="booking-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Tên phim</th>
            <th>Rạp</th>
            <th>Suất chiếu</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBookings.map((b) => {
            const movieTitle = movies[b.movie_id] || b.movie_id;
            const showtime = showtimes[b.showtime_id];
            const userName = users[b.user_id] || b.user_id;

            return (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{userName}</td>
                <td>{movieTitle}</td>
                <td>
                  {showtime?.theater.theaterName} - {showtime?.room.roomName}
                </td>
                <td>
                  {showtime
                    ? formatDateTime(showtime.startTime)
                    : b.showtime_id}
                </td>

                <td>{formatDateTime(b.created_at)}</td>
                <td>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                    .format(b.total_price)
                    .replace("₫", "")}
                  <u>đ</u>
                </td>
                <td>
                  <button
                    className="booking-details-btn"
                    onClick={() =>
                      setSelectedBooking({
                        ...b,
                        movie: { title: movies[b.movie_id] },
                        showtime: showtimes[b.showtime_id],
                      })
                    }
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="booking-management-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Trang trước
          </button>

          <span>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Trang sau
          </button>
        </div>
      )}

      {selectedBooking && (
        <TicketDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default BookingManagement;
