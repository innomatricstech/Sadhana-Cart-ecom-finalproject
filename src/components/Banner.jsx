import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; 
import "./Banner.css";

function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posters"));
        const bannerList = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'active') { 
            bannerList.push({
              id: doc.id,
              url: data.image,
              title: data.title,
              description: data.description 
            });
          }
        });

        setBanners(bannerList);
      } catch (error) {
        console.error("Error fetching banners:", error); 
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="banner-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="no-banners">
        <div className="no-banners-icon">🖼️</div>
        <p>No banners available</p>
      </div>
    );
  }

  return (
    <div className="banner-container">
      <div className="banner-carousel">
        {/* Banner Images */}
        <div className="banner-images">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner-image-wrapper ${index === currentIndex ? 'active' : ''}`}
            >
              <img
                src={banner.url}
                alt={banner.title}
                className="banner-img"
                loading="lazy"
              />
              
              {/* Gradient Overlay - Lighter for white background */}
              <div className="gradient-overlay"></div>
              
              {/* Content */}
              <div className="banner-content">
                <div className="content-wrapper">
                  <h2 className="banner-title">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="banner-description">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button 
          className="carousel-nav prev" 
          onClick={handlePrev}
          aria-label="Previous banner"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className="carousel-nav next" 
          onClick={handleNext}
          aria-label="Next banner"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Indicators */}
        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${((currentIndex + 1) / banners.length) * 100}%`
          }}></div>
        </div>
      </div>
    </div>
  );
}

export default Banner;