// SecondHeader.js - Modified
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SecondHeader.css";
import {
  FaBars,
  FaTimes,
  FaStore,
  FaSpinner
} from "react-icons/fa";
import { db, collection, getDocs } from "../../firebase";

const SecondHeader = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesRef = collection(db, "category");
        const snapshot = await getDocs(categoriesRef);
        
        const categoriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by name or timestamp
        categoriesList.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp) - new Date(a.timestamp);
          }
          return a.name?.localeCompare(b.name);
        });
        
        // Add Home as a special category
        const allCategories = [
           
          ...categoriesList
        ];
        
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category click
  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);
    if (mobileMenu) {
      setMobileMenu(false);
    }
    
    // If it's Home (static)
    if (category.isStatic) {
      navigate(category.path);
      return;
    }
    
    // For dynamic categories
    navigate(`/category/${category.id}`, { 
      state: { categoryName: category.name } 
    });
  };

  const toggleMenu = () => setMobileMenu(!mobileMenu);

  return (
    <div className="second-header-wrapper">
      <div className="second-header">
        {/* LEFT MENU */}
        <div className="menu-left">
          {/* ALL CATEGORIES - MOBILE */}
          <div className="menu-item all" onClick={toggleMenu}>
            <FaBars className="menu-icon" />
            ALL CATEGORIES
          </div>

          {/* DESKTOP MENU */}
          <ul className="menu-list desktop-menu">
            {loading ? (
              <li className="menu-item loading">
                <FaSpinner className="spinner" />
                Loading...
              </li>
            ) : (
              categories.slice(0, 15).map((category) => (
                <li
                  key={category.id}
                  className={`menu-item ${activeCategory === category.id ? "active" : ""}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="menu-link-custom category-link">
                    {category.name}
                  </span>
                </li>
              ))
            )}
          </ul>

          {/* MOBILE DROPDOWN MENU */}
          <ul className={`menu-list mobile-menu ${mobileMenu ? "active" : ""}`}>
            {mobileMenu && (
              <>
                {loading ? (
                  <li className="menu-item loading">
                    <FaSpinner className="spinner" />
                    Loading categories...
                  </li>
                ) : (
                  categories.map((category) => (
                    <li
                      key={category.id}
                      className={`menu-item ${activeCategory === category.id ? "active" : ""}`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <span className="menu-link-custom">
                        {category.name}
                      </span>
                    </li>
                  ))
                )}
              </>
            )}
          </ul>
        </div>

        {/* CLOSE ICON FOR MOBILE */}
        {mobileMenu && (
          <FaTimes className="close-icon" onClick={toggleMenu} />
        )}
      </div>
    </div>
  );
};

export default SecondHeader;