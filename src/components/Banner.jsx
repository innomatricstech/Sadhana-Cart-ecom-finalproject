import React, { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./Banner.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const snap = await getDocs(collection(db, "posters"));
      const list = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.status === "active") {
          list.push({ id: doc.id, image: d.image });
        }
      });
      setBanners(list.slice(0, 5));
    };
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % banners.length);
    setProgress(0);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setProgress(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 0.7; // Speed of progress bar
      });
    }, 50);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  // Helper to get 3 images to show
  const getVisibleIndices = () => {
    const prev = (index - 1 + banners.length) % banners.length;
    const curr = index;
    const next = (index + 1) % banners.length;
    return { prev, curr, next };
  };

  if (banners.length < 1) return <div className="banner-loader">Loading...</div>;

  const { prev, curr, next } = getVisibleIndices();

  return (
    <section className="banner-wrapper">
      {/* Dynamic Background */}
      <div className="banner-bg">
        <img src={banners[curr]?.image} alt="bg" />
        <div className="overlay"></div>
      </div>

      <div className="banner-progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="slides-container">
        {banners.map((b, i) => {
          let slideClass = "banner-slide";
          if (i === curr) slideClass += " center";
          else if (i === prev) slideClass += " left";
          else if (i === next) slideClass += " right";
          else slideClass += " hidden";

          return (
            <div key={b.id} className={slideClass}>
              <img src={b.image} alt="Banner" />
            </div>
          );
        })}
      </div>

      <div className="banner-nav">
        <button onClick={prevSlide} className="nav-btn left">
          <FaChevronLeft />
        </button>
        <button onClick={nextSlide} className="nav-btn right">
          <FaChevronRight />
        </button>
      </div>

      <div className="banner-dots">
        {banners.map((_, i) => (
          <span
            key={i}
            className={index === i ? "dot active" : "dot"}
            onClick={() => {
              setIndex(i);
              setProgress(0);
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Banner;