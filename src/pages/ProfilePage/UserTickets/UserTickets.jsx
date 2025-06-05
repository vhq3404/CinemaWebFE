import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieAgeBadge from "../../../components/MovieAgeBadge/MovieAgeBadge";
import TicketDetails from "../../../components/TicketDetails/TicketDetails";
import FoodDetails from "../../../components/TicketDetails/FoodDetails";
import popcornImage from "../../../assets/Popcorn.png";
import "./UserTickets.css";

const UserTickets = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("tickets");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedFoodBooking, setSelectedFoodBooking] = useState(null);
  const [foodBookings, setFoodBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [foodCurrentPage, setFoodCurrentPage] = useState(1);
  const BOOKINGS_PER_PAGE = 5;
  const FOODS_PER_PAGE = 5;
  useEffect(() => {
    const fetchBookingsWithDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings/user/${userId}`
        );
        const bookingsData = res.data;

        const bookingsWithDetails = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const showtimeRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/showtimes/${booking.showtime_id}`
              );
              const showtime = showtimeRes.data.showtime;

              let movie = null;
              try {
                const movieRes = await axios.get(
                  `${process.env.REACT_APP_API_URL}/api/movies/${booking.movie_id}`
                );
                movie = movieRes.data;
              } catch (err) {
                console.warn(`Không lấy được phim ${booking.movie_id}`, err);
              }

              return { ...booking, showtime, movie };
            } catch (err) {
              console.error(
                `Lỗi khi lấy suất chiếu cho booking ${booking.id}:`,
                err
              );
              return { ...booking, showtime: null, movie: null };
            }
          })
        );

        const filteredBookings = bookingsWithDetails.filter(
          (booking) => booking.status !== "PENDING"
        );

        const sorted = filteredBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.showtime?.startTime || 0);
          const dateB = new Date(b.createdAt || b.showtime?.startTime || 0);
          return dateB - dateA;
        });

        setBookings(sorted);
      } catch (err) {
        setError("Không thể tải danh sách vé.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchBookingsWithDetails();
  }, [userId]);

  useEffect(() => {
    const fetchFoodBookings = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/food-bookings/user/${userId}`
        );
        setFoodBookings(res.data.food_bookings || []);
      } catch (err) {
        console.error("Lỗi khi tải food bookings:", err);
      }
    };

    if (userId) fetchFoodBookings();
  }, [userId]);
  useEffect(() => {
    setCurrentPage(1);
    setFoodCurrentPage(1);
  }, [activeTab]);

  const totalPages = Math.ceil(bookings.length / BOOKINGS_PER_PAGE);
  const currentBookings = bookings.slice(
    (currentPage - 1) * BOOKINGS_PER_PAGE,
    currentPage * BOOKINGS_PER_PAGE
  );

  const totalFoodPages = Math.ceil(foodBookings.length / FOODS_PER_PAGE);
  const currentFoodBookings = foodBookings.slice(
    (foodCurrentPage - 1) * FOODS_PER_PAGE,
    foodCurrentPage * FOODS_PER_PAGE
  );

  const formatShowtime = (isoDateString) => {
    const date = new Date(isoDateString);
    const time = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const weekday = date.toLocaleDateString("vi-VN", { weekday: "long" });
    const fullDate = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${time} - ${capitalizeFirstLetter(weekday)}, ${fullDate}`;
  };

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const handleDetailClick = (booking) => {
    setSelectedBooking(booking);
  };
  const handleFoodDetailClick = (foodBooking) => {
    setSelectedFoodBooking(foodBooking);
    setSelectedBooking(null);
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-bookings-container">
      <h2>Lịch sử giao dịch</h2>

      {/* TAB CHỌN */}
      <div className="booking-tabs">
        <button
          className={activeTab === "tickets" ? "active" : ""}
          onClick={() => setActiveTab("tickets")}
        >
          Vé đã đặt
        </button>
        <button
          className={activeTab === "foods" ? "active" : ""}
          onClick={() => setActiveTab("foods")}
        >
          Đồ ăn đã đặt
        </button>
      </div>

      {/* TAB: VÉ ĐÃ ĐẶT */}
      {activeTab === "tickets" && (
        <>
          {bookings.length === 0 ? (
            <p>Bạn chưa đặt vé nào.</p>
          ) : (
            <>
              <ul className="booking-list">
                {currentBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="booking-item"
                    onClick={() => handleDetailClick(booking)}
                    style={{ cursor: "pointer" }}
                  >
                    {booking.showtime ? (
                      <div className="movie-info-container">
                        <img
                          src={`${process.env.REACT_APP_API_URL}/movies/${booking.movie?.poster}`}
                          alt="Poster phim"
                          className="booking-detail-movie-poster"
                        />
                        <div className="movie-info-columns">
                          <div className="left-column">
                            <div className="movie-title">
                              {booking.movie?.title}
                            </div>
                            <div className="movie-age-badge-wrapper">
                              <MovieAgeBadge age={booking.movie?.age} />
                            </div>
                          </div>
                          <div className="right-column">
                            <div className="right-column-content">
                              <div className="theater-info">
                                {booking.showtime.theater.theaterName} -{" "}
                                {booking.showtime.room.roomName}
                              </div>
                              <div className="showtime-info">
                                {formatShowtime(booking.showtime.startTime)}
                              </div>
                              {booking.status === "REFUND_REQUESTED" && (
                                <div
                                  style={{
                                    marginTop: 6,
                                    color: "#ff6600",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Đang xử lý hoàn tiền
                                </div>
                              )}
                              {booking.status === "CANCELLED" && (
                                <div
                                  style={{
                                    marginTop: 6,
                                    color: "red",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Đã hủy vé
                                </div>
                              )}
                            </div>
                            <button
                              className="booking-details-button"
                              onClick={() => handleDetailClick(booking)}
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <em>Không lấy được thông tin suất chiếu.</em>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div className="pagination">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Trang trước
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* TAB: ĐỒ ĂN */}
      {activeTab === "foods" && (
        <>
          {currentFoodBookings.length === 0 ? (
            <p>Bạn chưa đặt đồ ăn nào.</p>
          ) : (
            <>
              <ul className="booking-list">
                {currentFoodBookings.map((food) => (
                  <li
                    key={food.id}
                    className="booking-item"
                    onClick={() => handleFoodDetailClick(food)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="movie-info-container">
                      <img
                        src={popcornImage}
                        alt="Đồ ăn"
                        className="booking-food-image"
                      />
                      <div className="movie-info-columns">
                        <div className="left-column">
                          <div className="movie-title">Mã đơn: #{food.id}</div>
                          <div className="food-names-preview">
                            {food.items.length > 0 ? (
                              food.items.slice(0, 2).map((item) => (
                                <div key={item.id}>
                                  {item.food_name} × {item.quantity}
                                </div>
                              ))
                            ) : (
                              <div>Không có món</div>
                            )}
                          </div>
                        </div>
                        <div className="right-column">
                          <div className="right-column-content">
                            <div className="showtime-info">
                              {formatShowtime(food.created_at)}
                            </div>
                            <div className="theater-info">
                              <strong>Tổng cộng:</strong>{" "}
                              {Number(food.total_price).toLocaleString("vi-VN")}
                              đ
                            </div>
                          </div>
                          <button
                            className="booking-details-button"
                            onClick={() => handleFoodDetailClick(food)}
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="pagination">
                <button
                  onClick={() =>
                    setFoodCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={foodCurrentPage === 1}
                  className="pagination-button"
                >
                  Trang trước
                </button>
                <span className="pagination-info">
                  Trang {foodCurrentPage} / {totalFoodPages}
                </span>
                <button
                  onClick={() =>
                    setFoodCurrentPage((prev) =>
                      Math.min(prev + 1, totalFoodPages)
                    )
                  }
                  disabled={foodCurrentPage === totalFoodPages}
                  className="pagination-button"
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </>
      )}

      {selectedBooking && (
        <TicketDetails
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      {selectedFoodBooking && (
        <FoodDetails
          booking={selectedFoodBooking}
          onClose={() => setSelectedFoodBooking(null)}
        />
      )}
    </div>
  );
};

export default UserTickets;
