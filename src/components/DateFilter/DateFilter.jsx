import React from "react";
import "./DateFilter.css";

const DateFilter = ({ showtimes, selectedDate, setSelectedDate }) => {
  // Hàm lấy tên ngày trong tuần
  const getDayName = (date) => {
    const daysOfWeek = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const dateObj = new Date(date);
    return daysOfWeek[dateObj.getDay()];
  };

  // Hàm định dạng ngày theo kiểu dd/MM
  const formatDate = (date) => {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  // Hàm xử lý khi bấm chọn ngày
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="date-filter">
      {showtimes.length > 0 ? (
        showtimes.map((date, index) => {
          const formattedDate = formatDate(date);
          const dayName = getDayName(date);
          const isToday = new Date(date).toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              className={`date-button ${selectedDate === date ? "selected" : ""}`}
              onClick={() => handleDateClick(date)}
            >
              <span className="day-name">{isToday ? "Hôm nay" : dayName}</span>
              <span className="date">{formattedDate}</span>
            </button>
          );
        })
      ) : (
        <p>Chưa có ngày chiếu.</p>
      )}
    </div>
  );
};

export default DateFilter;
