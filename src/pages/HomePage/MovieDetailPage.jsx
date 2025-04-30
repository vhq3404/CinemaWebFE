import React from "react";
import { useParams } from "react-router-dom";

const MovieDetailPage = () => {
  const { id } = useParams(); 

  return (
    <div>
      <h1>Chi tiết phim</h1>
      <p>ID phim: {id}</p>
    </div>
  );
};

export default MovieDetailPage;