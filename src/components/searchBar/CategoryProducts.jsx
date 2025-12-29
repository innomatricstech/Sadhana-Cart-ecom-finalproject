// CategoryProducts.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { db, collection, getDocs, query, where } from "../../firebase";
import "./CategoryProducts.css";
import { FaHome, FaSpinner } from "react-icons/fa";

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  /* ---------------- COLOR HELPERS ---------------- */
  const extractColorFromDescription = (description) => {
    if (!description) return "Black";
    const match = description.match(/color:\s*([a-zA-Z\s]+)/i);
    return match ? match[1].trim() : "Black";
  };

  const getProductColor = (product) =>
    product.color || extractColorFromDescription(product.description);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProductsByCategory = useCallback(async () => {
    try {
      setLoading(true);

      let currentCategory = location.state?.categoryName || "";

      if (!currentCategory) {
        const catRef = collection(db, "category");
        const catQ = query(catRef, where("__name__", "==", categoryId));
        const snap = await getDocs(catQ);
        if (!snap.empty) currentCategory = snap.docs[0].data().name;
      }

      setCategoryName(currentCategory);

      const prodRef = collection(db, "products");
      let list = [];

      // by categoryId
      const q1 = query(prodRef, where("categoryId", "==", categoryId));
      const s1 = await getDocs(q1);
      list = s1.docs.map((d) => ({ id: d.id, ...d.data() }));

      // fallback by category name
      if (list.length === 0 && currentCategory) {
        const q2 = query(prodRef, where("category", "==", currentCategory));
        const s2 = await getDocs(q2);
        list = s2.docs.map((d) => ({ id: d.id, ...d.data() }));
      }

      setProducts(list);
      setFilteredProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, location.state]);

  useEffect(() => {
    if (categoryId) fetchProductsByCategory();
  }, [categoryId, fetchProductsByCategory]);

  /* ---------------- SEARCH ---------------- */
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          p.name?.toLowerCase().includes(value) ||
          p.description?.toLowerCase().includes(value)
      )
    );
  };

  /* ---------------- IMAGE ---------------- */
  const getFirstImage = (product) =>
    product.images?.[0] ||
    product.image ||
    "https://via.placeholder.com/300x400?text=No+Image";

  /* ---------------- UI ---------------- */
  return (
    <div className="category-products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-link">
          <FaHome /> Home
        </Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">
          {categoryName || "Category"}
        </span>
      </div>

      {/* Header */}
       

      {/* Loading */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner-large" />
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card exact-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* Image */}
              <div className="exact-image-wrapper">
                <img
                  src={getFirstImage(product)}
                  alt={product.name}
                  className="exact-product-image"
                />
              </div>

              {/* Details */}
              <div className="exact-details">
                <h3 className="exact-title">{product.name}</h3>

                <p className="exact-color">
                  Color: <span>{getProductColor(product)}</span>
                </p>

                <p className="exact-price">
                  ₹{product.price?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-products">
          <h3>No products found</h3>
          <Link to="/" className="browse-btn">
            Browse All Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
