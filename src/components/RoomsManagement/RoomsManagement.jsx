import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./RoomsManagement.css";
import RoomLayout from "../RoomLayout/RoomLayout";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";

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
  const [editingRoom, setEditingRoom] = useState(null); // Lưu phòng đang chỉnh sửa
  const [editForm, setEditForm] = useState({
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
  const handleViewLayout = async (room) => {
    try {
      // Gọi API để lấy danh sách ghế của phòng này mỗi lần mở modal
      const seatsResponse = await axios.get(
        `http://localhost:8080/api/seats/room/${room.id}`
      );
      const seats = seatsResponse.data.seats || [];

      // Lưu thông tin ghế vào state
      setSelectedSeats({ seats, room_id: room.id });
      setIsOverlayVisible(true);
    } catch (error) {
      console.error("Lỗi khi tải sơ đồ ghế:", error);
      alert("Không thể tải sơ đồ ghế. Vui lòng thử lại.");
    }
  };

  const closeOverlay = () => {
    setIsOverlayVisible(false);
    setSelectedSeats(null);
  };

  const extractRoomNumber = (name) => {
    const match = name.match(/\d+/); // lấy số đầu tiên xuất hiện
    return match ? parseInt(match[0]) : 0;
  };

  const groupRoomsByType = (rooms) => {
    const grouped = rooms.reduce((groups, room) => {
      if (!groups[room.room_type]) groups[room.room_type] = [];
      groups[room.room_type].push(room);
      return groups;
    }, {});

    // Sắp xếp từng nhóm phòng theo số trong tên phòng
    Object.keys(grouped).forEach((type) => {
      grouped[type].sort((a, b) => {
        return extractRoomNumber(a.room_name) - extractRoomNumber(b.room_name);
      });
    });

    return grouped;
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
    const room = rooms.find((r) => r.id === id);
    if (room) {
      setEditingRoom(room);
      setEditForm({
        room_name: room.room_name,
        room_type: room.room_type,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.room_name || !editForm.room_type) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/rooms/${editingRoom.id}`, {
        ...editForm,
        theater_id: theaterId,
      });
      setEditingRoom(null);
      // Reload danh sách phòng
      const res = await axios.get(
        `http://localhost:8080/api/rooms/theater/${theaterId}`
      );
      setRooms(res.data);
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng:", error);
      alert("Cập nhật phòng thất bại.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng này không?")) {
      try {
        await axios.delete(`http://localhost:8080/api/rooms/${id}`);
        // Load lại danh sách phòng
        const res = await axios.get(
          `http://localhost:8080/api/rooms/theater/${theaterId}`
        );
        setRooms(res.data);
      } catch (error) {
        console.error("Lỗi khi xóa phòng:", error);
        alert("Xóa phòng thất bại. Vui lòng thử lại.");
      }
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

              {/* Dropdown chọn loại phòng */}
              <select
                name="room_type"
                value={newRoom.room_type}
                onChange={handleInputChange}
              >
                <option value="">Chọn loại phòng</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </select>

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
            <thead>
              <tr>
                <th>Loại phòng</th>
                <th>Tên phòng</th>
                <th>Sơ đồ</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {["2D", "3D", "IMAX"].map((type, groupIndex, arr) => {
                const roomsOfType = groupedRooms[type];
                if (!roomsOfType) return null;

                return (
                  <React.Fragment key={type}>
                    {roomsOfType.map((room, index) => (
                      <tr key={room.id}>
                        {index === 0 && (
                          <td
                            className="room-type-cell"
                            rowSpan={roomsOfType.length}
                          >
                            {type}
                          </td>
                        )}
                        <td>{room.room_name}</td>
                        <td>
                          <button
                            className="link-btn"
                            onClick={() => handleViewLayout(room)}
                          >
                            Xem sơ đồ
                          </button>
                        </td>
                        <td>
                          <div className="admin-room-actions">
                            <button
                              className="update-room-button"
                              onClick={() => handleEdit(room.id)}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="delete-room-button"
                              onClick={() => handleDelete(room.id)}
                            >
                              <MdDeleteOutline />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Dòng ngăn cách sau mỗi nhóm, trừ nhóm cuối */}
                    {groupIndex < arr.length - 1 &&
                      arr.some((t, i) => i > groupIndex && groupedRooms[t]) && (
                        <tr className="group-divider">
                          <td colSpan="4"></td>
                        </tr>
                      )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isOverlayVisible && selectedSeats && (
        <RoomLayout
          room_id={selectedSeats.room_id}
          initialSeats={selectedSeats.seats}
          onClose={closeOverlay}
        />
      )}

      {editingRoom && (
        <div className="room-modal-overlay">
          <div className="room-modal">
            <h3 className="title">Chỉnh sửa phòng chiếu</h3>

            <input
              type="text"
              name="room_name"
              placeholder="Tên phòng"
              value={editForm.room_name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, room_name: e.target.value }))
              }
            />

            <select
              name="room_type"
              value={editForm.room_type}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, room_type: e.target.value }))
              }
            >
              <option value="">Chọn loại phòng</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
            </select>

            <div className="room-modal-buttons">
              <button onClick={handleSaveEdit}>Lưu</button>
              <button
                onClick={() => setEditingRoom(null)}
                className="room-cancel-btn"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManagement;
