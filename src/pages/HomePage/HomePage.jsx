import React from 'react';
import FooterComponent from '../../components/FooterComponent/FooterComponent'; 
import BannerComponent from '../../components/BannerComponent/BannerComponent';
import MoviePage from '../../components/MoviePage/MoviePage';
import CommentsComponent from '../../components/CommentsComponent/CommentsComponent';

function HomePage() {
    return (
        <div>
            <BannerComponent />
            <MoviePage />
            <FooterComponent />
        </div>
    );
}

export default HomePage;