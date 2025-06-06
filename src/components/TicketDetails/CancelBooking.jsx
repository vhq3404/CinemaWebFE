import React, { useState, useEffect } from "react";
import Select from "react-select";
import MoMoLogo from "../../assets/MoMo_Logo.png";
import BankLogo from "../../assets/pngimg.com - bank_PNG3.png";
import "./CancelBooking.css";

const CancelBooking = ({ booking, onClose, onCancelSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refundMethod, setRefundMethod] = useState("momo");
  const [agreedPolicy, setAgreedPolicy] = useState(false);

  const [banks, setBanks] = useState([]);
  // Thay selectedBankCode thành selectedBank chứa { name, shortName }
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [momoPhone, setMomoPhone] = useState("");
  const [momoName, setMomoName] = useState("");

  // Lấy danh sách ngân hàng từ API khi component mount
  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "00" && Array.isArray(data.data)) {
          setBanks(data.data);
          if (data.data.length > 0)
            setSelectedBank({
              name: data.data[0].name,
              shortName: data.data[0].shortName,
            });
        } else {
          setError("Không thể tải danh sách ngân hàng.");
        }
      })
      .catch(() => {
        setError("Lỗi kết nối API ngân hàng.");
      });
  }, []);

  // Chuyển banks thành options cho react-select (có label chứa ảnh + tên)
  const bankOptions = banks.map((bank) => ({
    value: { name: bank.name, shortName: bank.shortName },
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={bank.logo}
          alt={bank.name}
          style={{ width: 100, height: 50, objectFit: "contain" }}
          onError={(e) => {
            e.target.src = BankLogo;
          }} // fallback logo nếu lỗi
        />
        <span>
          {bank.name} ({bank.shortName})
        </span>
      </div>
    ),
  }));

  // Hàm tính số tiền hoàn lại dựa vào thời gian hiện tại và suất chiếu
  const calculateRefund = () => {
    if (!booking?.showtime?.startTime || !booking?.total_price) return 0;

    const now = new Date();
    const startTime = new Date(booking.showtime.startTime);
    const diffMs = startTime - now; // ms giữa suất chiếu và bây giờ
    const diffHours = diffMs / (1000 * 60 * 60); // quy đổi ra giờ

    if (diffHours > 24) {
      return booking.total_price; // hoàn 100%
    } else if (diffHours > 1) {
      return booking.total_price * 0.6; // hoàn 60%
    } else if (diffHours > 0) {
      return booking.total_price * 0.3; // hoàn 30%
    } else {
      return 0; // quá giờ chiếu => không hoàn
    }
  };

  const refundAmount = calculateRefund();

  const handleCancelBooking = async () => {
    setLoading(true);
    setError(null);

    // Validate thông tin
    if (refundMethod === "momo") {
      if (!momoPhone.trim() || !momoName.trim()) {
        setError("Vui lòng nhập đầy đủ thông tin Momo.");
        setLoading(false);
        return;
      }
    } else if (refundMethod === "bank") {
      if (
        !selectedBank ||
        !selectedBank.name ||
        !selectedBank.shortName ||
        !bankAccount.trim() ||
        !accountHolder.trim()
      ) {
        setError("Vui lòng nhập đầy đủ thông tin ngân hàng.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        amount: refundAmount,
        method: refundMethod,
        ...(refundMethod === "momo"
          ? {
              phone: momoPhone.trim(),
              momo_account_name: momoName.trim(),
            }
          : {
              bank_account_name: accountHolder.trim(),
              bank_account_number: bankAccount.trim(),
              bank_name: `${selectedBank?.name} (${selectedBank?.shortName})`,
            }),
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/bookings/${booking?.id}/refund-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gửi yêu cầu hoàn tiền thất bại.");
      }

      if (onCancelSuccess) onCancelSuccess();
      window.location.reload();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi hủy vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cancel-booking-container"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Xác nhận hủy vé</h3>

      <div className="cancel-booking-policy">
        <h4>Chính sách hủy vé:</h4>
        <ul>
          <li>
            Hủy vé trước suất chiếu hơn 24 giờ: Hoàn 100% số tiền đã thanh toán.
          </li>
          <li>
            Hủy vé trước suất chiếu từ 24 giờ đến trước 1 giờ: Hoàn 60% số tiền
            đã thanh toán.
          </li>
          <li>
            Hủy vé trong vòng 1 giờ trước suất chiếu: Hoàn 30% số tiền đã thanh
            toán.
          </li>
          <li>Điểm thưởng hoặc ưu đãi đã sử dụng sẽ không được hoàn lại.</li>
          <li>Vé đã hủy không thể khôi phục lại.</li>
        </ul>
      </div>
      <p>
        <strong>Bạn sẽ được hoàn lại: </strong>
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        })
          .format(refundAmount)
          .replace("₫", "")}
        <u>đ</u>
      </p>

      <div className="refund-method">
        <p>
          <strong>Bạn muốn nhận tiền qua:</strong>
        </p>
        <div className="refund-tabs">
          <button
            className={refundMethod === "momo" ? "active" : ""}
            onClick={() => setRefundMethod("momo")}
            type="button"
          >
            <img
              src={MoMoLogo}
              alt="MoMo Logo"
              style={{
                width: 30,
                height: 30,
                verticalAlign: "middle",
                marginRight: 8,
              }}
            />
            MoMo
          </button>
          <button
            className={refundMethod === "bank" ? "active" : ""}
            onClick={() => setRefundMethod("bank")}
            type="button"
          >
            <img
              src={BankLogo}
              alt="Bank Logo"
              style={{
                width: 30,
                height: 30,
                verticalAlign: "middle",
                marginRight: 8,
              }}
            />
            Ngân hàng
          </button>
        </div>

        <div className="refund-tab-content">
          {refundMethod === "momo" && (
            <div>
              <label>
                Số điện thoại Momo:
                <input
                  type="text"
                  placeholder="Nhập số điện thoại Momo"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                />
              </label>
              <label>
                Tên tài khoản Momo:
                <input
                  type="text"
                  placeholder="Nhập tên tài khoản Momo"
                  value={momoName}
                  onChange={(e) => setMomoName(e.target.value)}
                />
              </label>
            </div>
          )}
          {refundMethod === "bank" && (
            <div>
              <label>
                Ngân hàng:
                <Select
                  options={bankOptions}
                  value={
                    selectedBank
                      ? bankOptions.find(
                          (opt) =>
                            opt.value.name === selectedBank.name &&
                            opt.value.shortName === selectedBank.shortName
                        )
                      : null
                  }
                  onChange={(selected) => setSelectedBank(selected.value)}
                  getOptionLabel={({ label }) => label}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      marginTop: "10px",
                      width: "97.8%",
                    }),
                    option: (provided) => ({
                      ...provided,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }),
                  }}
                  isSearchable
                />
              </label>
              <label>
                Số tài khoản:
                <input
                  type="text"
                  placeholder="Nhập số tài khoản"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                />
              </label>
              <label>
                Chủ tài khoản:
                <input
                  type="text"
                  placeholder="Nhập tên chủ tài khoản"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {error && <p className="cancel-booking-error">{error}</p>}
      <div className="cancel-policy-agree">
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={agreedPolicy}
            onChange={(e) => setAgreedPolicy(e.target.checked)}
          />
          Tôi đã đọc và hiểu chính sách hủy vé và hoàn tiền.
        </label>
      </div>

      <div className="cancel-booking-buttons">
        <button onClick={onClose} disabled={loading}>
          Quay lại
        </button>
        <button
          onClick={handleCancelBooking}
          disabled={loading || !agreedPolicy}
        >
          {loading ? "Đang hủy..." : "Xác nhận hủy"}
        </button>
      </div>
    </div>
  );
};

export default CancelBooking;
