import React from 'react';
import FooterComponent from '../../components/FooterComponent/FooterComponent'; 
import BannerComponent from '../../components/BannerComponent/BannerComponent';
import TrendingMoviesComponent from '../../components/TrendingMoviesComponent/TrendingMoviesComponent';
import CommentsComponent from '../../components/CommentsComponent/CommentsComponent';

function HomePage() {
    return (
        <div>
            <BannerComponent />
            <TrendingMoviesComponent />
            <CommentsComponent />
            <FooterComponent />
        </div>
    );
}

export default HomePage;