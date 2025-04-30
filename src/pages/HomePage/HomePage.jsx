import React from 'react';
import FooterComponent from '../../components/FooterComponent/FooterComponent'; 
import BannerComponent from '../../components/BannerComponent/BannerComponent';

function HomePage() {
    return (
        <div>
            <h1>CinemaWeb</h1>
            <BannerComponent />
            <FooterComponent />
        </div>
    );
}

export default HomePage;