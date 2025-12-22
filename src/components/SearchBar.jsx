import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* ---------------- UTIL: HIGHLIGHT TEXT ---------------- */
  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  /* ---------------- TRENDING PRODUCTS ---------------- */
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrending(data);
      } catch (err) {
        console.error("Trending fetch error:", err);
      }
    };

    fetchTrending();

    // Load recent searches
    const stored = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(stored);
  }, []);

  /* ---------------- SEARCH PRODUCTS ---------------- */
  const fetchSearchData = async (value) => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const keyword = value.toLowerCase();

    try {
      const productsRef = collection(db, "products");

      const q = query(
        productsRef,
        where("searchkeywords", "array-contains", keyword),
        limit(6)
      );

      const snap = await getDocs(q);
      let results = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fallback partial match
      if (results.length === 0) {
        const allSnap = await getDocs(query(productsRef, limit(20)));
        results = allSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p =>
            p.pattern?.toLowerCase().includes(keyword)
          );
      }

      setSuggestions(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DEBOUNCE ---------------- */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm) fetchSearchData(searchTerm);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    let updated = [term, ...recentSearches.filter(t => t !== term)];
    updated = updated.slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSelect = (product) => {
    saveRecentSearch(product.pattern);
    setSearchTerm(product.pattern || "");
    setShowDropdown(false);
    navigate(`/product/${product.id}`);
  };

  const handleSubmit = () => {
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
    setShowDropdown(false);
    navigate(`/search-results?q=${encodeURIComponent(searchTerm)}`);
  };

  /* ---------------- DELETE RECENT SEARCH ---------------- */
  const deleteRecentSearch = (term, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  /* ---------------- CLEAR ALL RECENT SEARCHES ---------------- */
  const clearAllRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.setItem("recentSearches", JSON.stringify([]));
  };

  return (
    <div
      className="search-bar-container-desktop position-relative w-100"
      ref={dropdownRef}
    >
      <div className="input-group">
        <input
          type="text"
          className="form-control search-input-desktop"
          placeholder="What are you looking for?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <button
          className="btn btn-warning px-4"
          onClick={handleSubmit}
        >
          <i className="fa fa-search"></i>
        </button>
      </div>

      {/* ---------------- DROPDOWN ---------------- */}
      {showDropdown && (
        <div className="suggestions-dropdown p-2">

          {/* LOADING SKELETON */}
          {loading && (
            <div className="skeleton-wrapper">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-item"></div>
              ))}
            </div>
          )}

          {!loading && searchTerm.length > 0 ? (
            suggestions.length > 0 ? (
              suggestions.map((p) => (
                <div
                  key={p.id}
                  className="suggestion-item d-flex align-items-center gap-3"
                  onClick={() => handleSelect(p)}
                >
                  {/* IMAGE */}
                  <img
                    src={p.image || p.thumbnail || p.images?.[0]}
                    alt={p.pattern}
                    className="search-suggestion-img"
                  />

                  {/* INFO */}
                  <div className="flex-grow-1">
                    <div className="fw-bold text-dark">
                      {highlightText(p.pattern, searchTerm)}
                    </div>

                    <div className="small text-muted">
                      {p.category}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="text-success fw-bold">
                        ₹{p.offerprice || p.price}
                      </span>

                      {p.mrp && p.offerprice && (
                        <span className="discount-badge">
                          {Math.round(
                            ((p.mrp - p.offerprice) / p.mrp) * 100
                          )}
                          % OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted">
                No products found for "{searchTerm}"
              </div>
            )
          ) : (
            <>
              {/* RECENT SEARCHES WITH HEADER */}
              {recentSearches.length > 0 && (
                <>
                  <div className="d-flex justify-content-between align-items-center px-3 py-2">
                    <div className="text-muted small fw-bold">
                      RECENT SEARCHES
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={clearAllRecentSearches}
                      style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((term, i) => (
                    <div
                      key={i}
                      className="suggestion-item d-flex justify-content-between align-items-center"
                      onClick={() => {
                        setSearchTerm(term);
                        fetchSearchData(term);
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className="fa fa-history me-2 text-muted"></i>
                        <span>{term}</span>
                      </div>
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={(e) => deleteRecentSearch(term, e)}
                        style={{ fontSize: "0.8rem" }}
                        title="Delete this search"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  ))}
                </>
              )}

              {/* TRENDING */}
              <div className="px-3 py-2 text-muted small fw-bold">
                TRENDING SEARCHES
              </div>
              {trending.map((p) => (
                <div
                  key={p.id}
                  className="suggestion-item d-flex align-items-center"
                  onClick={() => handleSelect(p)}
                >
                  <i className="fa fa-line-chart me-3 text-orange"></i>
                  <span>{p.pattern}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;