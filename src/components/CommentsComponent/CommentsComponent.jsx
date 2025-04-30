import React from "react";
import "./CommentsComponent.css";

const CommentsComponent = () => {
  const comments = [
    { id: 1, name: "Nguyễn Văn A", stars: 5, comment: "Phim rất hay, đáng xem! Nội dung hấp dẫn, diễn xuất tuyệt vời và âm nhạc rất phù hợp. Đây là một trong những bộ phim đáng nhớ nhất mà tôi từng xem." },
    { id: 2, name: "Trần Thị B", stars: 4, comment: "Phim ổn, nhưng có vài chỗ chưa hợp lý. Một số tình tiết hơi khó hiểu và kết thúc có phần vội vàng. Tuy nhiên, tổng thể thì đây vẫn là một bộ phim đáng xem." },
    { id: 3, name: "Lê Văn C", stars: 3, comment: "Phim tạm được, không quá đặc sắc. Cốt truyện khá đơn giản và không có nhiều điểm nhấn. Nhưng nếu bạn muốn giải trí nhẹ nhàng thì đây là một lựa chọn không tồi." },
    { id: 4, name: "Phạm Văn D", stars: 5, comment: "Tuyệt vời, rất đáng để xem! Bộ phim mang lại nhiều cảm xúc và thông điệp ý nghĩa. Tôi rất thích cách đạo diễn xây dựng nhân vật và câu chuyện." },
    { id: 5, name: "Hoàng Thị E", stars: 4, comment: "Phim hay nhưng kết thúc hơi nhanh. Tôi cảm thấy bộ phim có thể phát triển thêm một chút ở phần cuối để làm rõ hơn các tình tiết. Dù vậy, đây vẫn là một bộ phim đáng để thưởng thức." },
  ];

  return (
    <div className="comments-section">
      <h2>Đánh giá của khách hàng</h2>
      <div className="comments-carousel">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-stars">{"⭐".repeat(comment.stars)}</div>
            <div className="comment-header">
              <span className="comment-name">{comment.name}</span>
            </div>
            <p className="comment-text">{comment.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsComponent;