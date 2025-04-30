import React from 'react';
import FooterComponent from '../../components/FooterComponent/FooterComponent'; 
import BannerComponent from '../../components/BannerComponent/BannerComponent';
import TrendingMoviesComponent from '../../components/TrendingMoviesComponent/TrendingMoviesComponent';

function HomePage() {
    return (
        <div>
            <BannerComponent />
            <TrendingMoviesComponent />
            <FooterComponent />
        </div>
    );
}

export default HomePage;