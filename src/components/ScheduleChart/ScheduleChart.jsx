import React, { useState, useEffect } from "react";
import DateFilter from "../DateFilter/DateFilter";
import "./ScheduleChart.css";

const ScheduleChart = ({ filteredMovies, onClose, initialSelectedDate }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
  // Lấy tất cả các ngày có lịch chiếu từ filteredMovies
  const allShowtimes = filteredMovies.flatMap((movie) => movie.showtimes);
  const uniqueDates = Array.from(
    new Set(allShowtimes.map((showtime) => showtime.date))
  ).sort((a, b) => new Date(a) - new Date(b));

  setShowtimes(uniqueDates);

  if (uniqueDates.length > 0) {
    if (initialSelectedDate && uniqueDates.includes(initialSelectedDate)) {
      setSelectedDate(initialSelectedDate);
    } else {
      setSelectedDate(uniqueDates[0]);
    }
  }
}, [filteredMovies, initialSelectedDate]);

 // Nhập thủ công danh sách khung giờ cần hiển thị trên biểu đồ
const timeSlots = [
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
  "15:00", "15:15", "15:30", "15:45",
  "16:00", "16:15", "16:30", "16:45",
  "17:00", "17:15", "17:30", "17:45",
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45",
  "20:00", "20:15", "20:30", "20:45",
  "21:00", "21:15", "21:30", "21:45",
  "22:00", "22:15", "22:30", "22:45",
  "23:00", "23:15", "23:30", "23:45",
  "00:00", "00:15", "00:30", "00:45",
  "01:00", "01:15", "01:30", "01:45","02:00"
];

// Tổng số slot
const totalSlots = timeSlots.length;

// Hàm chuyển thời gian thành chỉ số slot dựa vào timeSlots thủ công
const getSlotIndex = (time) => {
  return timeSlots.indexOf(time);
};


  const toVietnamTimeHHMM = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const enrichedShowtimes = filteredMovies.flatMap((movie) =>
    movie.showtimes
      .filter((showtime) => showtime.date === selectedDate)
      .map((showtime) => ({
        ...showtime,
        title: movie.title,
        startIndex: getSlotIndex(toVietnamTimeHHMM(showtime.start_time)),
        endIndex: getSlotIndex(toVietnamTimeHHMM(showtime.end_time)),
      }))
  );

  const uniqueRooms = Array.from(
    new Set(enrichedShowtimes.map((s) => s.room_name))
  ).sort();

  return (
    <div className="room-overlay">
      <div className="room-layout-modal">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2> Biểu đồ thời gian chiếu</h2>

        <DateFilter
          showtimes={showtimes}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <div className="schedule-chart">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                {timeSlots.map((slot, idx) => (
                  <th key={idx}>{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueRooms.map((room, roomIndex) => {
                const roomShowtimes = enrichedShowtimes
                  .filter((s) => s.room_name === room)
                  .sort((a, b) => a.startIndex - b.startIndex);

                const cells = [];
                let currentSlot = 0;

                for (let i = 0; i < roomShowtimes.length; i++) {
                  const show = roomShowtimes[i];

                  // Thêm ô trống trước suất chiếu
                  if (show.startIndex > currentSlot) {
                    cells.push(
                      <td
                        key={`empty-${i}`}
                        colSpan={show.startIndex - currentSlot}
                      ></td>
                    );
                  }

                  // Thêm ô chứa tên phim, chiếm colSpan tương ứng thời gian
                  const span = show.endIndex - show.startIndex + 1; // +1 để bao gồm cả ô kết thúc
                  cells.push(
                    <td
                      key={`show-${i}`}
                      colSpan={span}
                      className="showtime-cell"
                    >
                      {show.title}
                    </td>
                  );

                  currentSlot = show.endIndex + 1; // Đảm bảo không lặp lại cột đã chiếm
                }

                // Thêm ô trống cuối nếu còn slot
                if (currentSlot < totalSlots) {
                  cells.push(
                    <td
                      key="empty-final"
                      colSpan={totalSlots - currentSlot}
                    ></td>
                  );
                }

                return (
                  <tr key={roomIndex}>
                    <td className="room-name">{room}</td>
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleChart;
