import React, { useState } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import MoviePage from "../../components/MoviePage/MoviePage";
import "./FeedbackPage.css";

const FeedbackPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    console.log({ SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY });

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY)
      .then(() => {
        toast.success(
          "Cảm ơn góp ý của bạn, chúng tôi sẽ phản hồi lại bạn sớm!"
        );
        setForm({ name: "", email: "", phone: "", message: "" });
      })
      .catch((error) => {
        console.error("Lỗi gửi email:", error);
        toast.error("Gửi góp ý thất bại. Vui lòng thử lại.");
      });
  };

  return (
    <div className="feedback-container">
      <div className="left-side">
        <div className="contact-info">
          <h1 className="feedback-title">Liên hệ</h1>
          <p>
            <strong>Email:</strong> support@infinitycinema.vn
          </p>
          <p>
            <strong>Hotline:</strong> 1900 1234 (8:00 - 22:00)
          </p>
        </div>

        <div className="feedback-form-box">
          <h1 className="feedback-title">Góp ý</h1>
          <form onSubmit={handleSubmit} className="feedback-form">
            <input
              name="name"
              placeholder="Họ và tên *"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Nội dung góp ý *"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit">Gửi góp ý</button>
          </form>
        </div>
      </div>

      <div className="right-side">
        <MoviePage isVertical={true} />
      </div>
    </div>
  );
};

export default FeedbackPage;
