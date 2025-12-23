import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SecondHeader.css";
import {
  FaBars,
  FaTimes,
  FaTags,
  FaStore,
  FaHandHoldingHeart,
  FaLaptop,
  FaUser,
  FaChild,
  FaShoePrints,
  FaGem,
  FaRedo,
  FaBoxOpen,
  FaBook
} from "react-icons/fa";

const SecondHeader = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const menuMap = [
    { name: "Home", icon: FaStore, path: "/" },
    { name: "Fashion", icon: FaLaptop, path: "/fashion" },
    { name: "Accessories", icon: FaUser, path: "/accessories" },
    { name: "Cosmetics", icon: FaTags, path: "/cosmetics" },
    { name: "Toys", icon: FaLaptop, path: "/toys" },
    { name: "Stationary", icon: FaShoePrints, path: "/stationary" },
    { name: "Book", icon: FaBook, path: "/book" },
    { name: "Photoframe", icon: FaGem, path: "/photoframe" },
    { name: "FootWears", icon: FaBoxOpen, path: "/footwears" },
    { name: "Jewellery", icon: FaGem, path: "/jewellery" },
    { name: "Mens", icon: FaChild, path: "/mens" },
    { name: "Kids", icon: FaChild, path: "/kids" },
    { name: "Electronics", icon: FaBoxOpen, path: "/electronics" },
    { name: "Personal Care", icon: FaRedo, path: "/personal-care" }
  ];

  const desktopMenu = menuMap.slice(0, 14);
  const mobileDropdown = menuMap;

  const toggleMenu = () => setMobileMenu(!mobileMenu);

  return (
    <div className="second-header-wrapper">
      <div className="second-header">
        {/* LEFT MENU */}
        <div className="menu-left">
          {/* ALL CATEGORIES */}
          <div className="menu-item all" onClick={toggleMenu}>
            <FaBars className="menu-icon" />
            ALL CATEGORIES
          </div>

          {/* MENU LIST */}
          <ul className={`menu-list ${mobileMenu ? "active" : ""}`}>
            {(mobileMenu ? mobileDropdown : desktopMenu).map((item, idx) => (
              <li
                key={idx}
                className="menu-item category-link-item"
                onClick={mobileMenu ? toggleMenu : undefined}
              >
                <Link to={item.path} className="menu-link-custom">
                  {mobileMenu && (
                    <item.icon className="menu-item-mobile-icon" />
                  )}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CLOSE ICON */}
        {mobileMenu && (
          <FaTimes className="close-icon" onClick={toggleMenu} />
        )}
      </div>
    </div>
  );
};

export default SecondHeader;
