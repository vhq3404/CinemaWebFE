import React from "react";
import "./MovieAgeBadge.css";

const MovieAgeBadge = ({ age }) => {
  // Kiểm tra nếu là unrated thì không hiển thị
  if (age === "unrated") return null;

  const getAgeClass = (age) => {
    if (age === "P") return "age-p";
    if (age === "T13") return "age-13";
    if (age === "T16") return "age-16";
    if (age === "T18") return "age-18";
    return "age-default";
  };

  return (
    <span className={`movie-age-badge ${getAgeClass(age)}`}>
      {age}
    </span>
  );
};

export default MovieAgeBadge;
