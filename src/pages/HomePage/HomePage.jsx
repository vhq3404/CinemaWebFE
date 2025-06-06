import React from "react";
import BannerComponent from "../../components/BannerComponent/BannerComponent";
import MoviePage from "../../components/MoviePage/MoviePage";

function HomePage() {
  return (
    <div>
      <BannerComponent />
      <MoviePage isHomePage={true} />
    </div>
  );
}

export default HomePage;
