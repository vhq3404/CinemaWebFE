import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./RoomsManagement.css";
import RoomLayout from "../RoomLayout/RoomLayout";

const RoomsManagement = ({ theaterId }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_name: "",
    room_type: "",
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom({ ...newRoom, [name]: value });
  };

  const handleCreateRoom = async () => {
    if (!newRoom.room_name || !newRoom.room_type) {
      alert("Vui lòng điền đầy đủ thông tin phòng chiếu.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/rooms", {
        ...newRoom,
        theater_id: theaterId,
      });
      closeModal();
      setNewRoom({ room_name: "", room_type: "" });
      // Gọi lại API để load danh sách phòng mới
      const res = await axios.get(
        `http://localhost:8080/api/rooms/theater/${theaterId}`
      );
      setRooms(res.data);
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      alert("Tạo phòng thất bại. Có thể tên phòng đã tồn tại.");
    }
  };

  // Khi nhấn "Xem sơ đồ"
  const handleViewLayout = (seats) => {
    setSelectedSeats(seats);
    setIsOverlayVisible(true);
  };

  const closeOverlay = () => {
    setIsOverlayVisible(false);
    setSelectedSeats(null);
  };

  const groupRoomsByType = (rooms) => {
    return rooms.reduce((groups, room) => {
      if (!groups[room.room_type]) groups[room.room_type] = [];
      groups[room.room_type].push(room);
      return groups;
    }, {});
  };

  const groupedRooms = useMemo(() => groupRoomsByType(rooms), [rooms]);

  useEffect(() => {
    if (!theaterId) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/rooms/theater/${theaterId}`
        );
        setRooms(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phòng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [theaterId]);

  const handleEdit = (id) => {
    console.log("Edit room", id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      console.log("Delete room", id);
    }
  };

  if (!theaterId) return null;

  return (
    <div className="room-container">
      <div className="header-row">
        <h2 className="title">Quản lý phòng chiếu</h2>
        <button className="create-btn" onClick={openModal}>
          Tạo phòng chiếu
        </button>
        {isModalOpen && (
          <div className="room-modal-overlay">
            <div className="room-modal">
              <h3 className="title">Tạo phòng chiếu mới</h3>
              <input
                type="text"
                name="room_name"
                placeholder="Tên phòng"
                value={newRoom.room_name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="room_type"
                placeholder="Loại phòng (VIP, thường...)"
                value={newRoom.room_type}
                onChange={handleInputChange}
              />
              <div className="room-modal-buttons">
                <button onClick={handleCreateRoom}>Tạo</button>
                <button onClick={closeModal} className="room-cancel-btn">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <p>Đang tải phòng chiếu...</p>
      ) : (
        <div className="table-wrapper">
          <table className="room-table">
            <tbody>
              {Object.entries(groupedRooms).map(([type, rooms]) =>
                rooms.map((room, index) => (
                  <tr key={room.id}>
                    <td className="room-type-cell">
                      {index === 0 ? type : ""}
                    </td>
                    <td>{room.room_name}</td>
                    <td>
                      {room.seats && room.seats.length > 0 ? (
                        <button
                          className="link-btn"
                          onClick={() => handleViewLayout(room.seats)}
                        >
                          Xem sơ đồ
                        </button>
                      ) : (
                        <button
                          className="link-btn"
                          onClick={() => handleViewLayout(room.seats)}
                        >
                          Thêm sơ đồ
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="button edit-btn"
                        onClick={() => handleEdit(room.id)}
                      >
                        Sửa
                      </button>
                      <button
                        className="button delete-btn"
                        onClick={() => handleDelete(room.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isOverlayVisible && (
        <RoomLayout seats={selectedSeats} onClose={closeOverlay} />
      )}
    </div>
  );
};

export default RoomsManagement;
