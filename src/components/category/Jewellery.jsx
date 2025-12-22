import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Spinner, Row, Col, Card, Alert } from "react-bootstrap";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { Link } from "react-router-dom";

// 🎨 Color Mapping Function
const getColorHex = (colorName) => {
  if (!colorName || colorName === "N/A") return "#cccccc"; // Default gray
  
  const colorMap = {
    red: "#ff6b6b",
    blue: "#4d96ff",
    green: "#6bcf7f",
    yellow: "#ffd93d",
    orange: "#ff9a3d",
    purple: "#9d65c9",
    pink: "#ff9cda",
    black: "#333333",
    white: "#ffffff",
    gray: "#adb5bd",
    grey: "#adb5bd",
    brown: "#a0522d",
    cyan: "#3dc7d6",
    teal: "#20c997",
    indigo: "#6610f2",
    lime: "#c0ca33",
    amber: "#ffb300",
    maroon: "#800000",
    navy: "#001f3f",
    olive: "#3d9970",
    silver: "#c0c0c0",
    gold: "#ffd700",
    violet: "#8a2be2",
    magenta: "#ff00ff",
    turquoise: "#40e0d0",
    coral: "#ff7f50",
    beige: "#f5f5dc",
    lavender: "#e6e6fa",
    mint: "#98ff98",
    peach: "#ffdab9",
    ruby: "#e0115f",
    sapphire: "#0f52ba",
    emerald: "#50c878",
    topaz: "#ffc87c",
    amethyst: "#9966cc",
  };

  const normalizedColor = colorName.toLowerCase().trim();
  return colorMap[normalizedColor] || "#cccccc";
};

// 🌈 Utility: Extract color from description
const extractColorFromDescription = (description) => {
  if (!description || typeof description !== "string") return "N/A";
  const match = description.match(/color:\s*([a-zA-Z]+)/i);
  return match ? match[1] : "N/A";
};

// 💎 Product Card
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const productColor =
    product.color || extractColorFromDescription(product.description);
  const colorHex = getColorHex(productColor);

  const cardStyle = {
    border: `3px solid ${colorHex}`,
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: isHovered
      ? `0 10px 25px rgba(0,0,0,0.15), 0 0 0 1px ${colorHex}40`
      : `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${colorHex}20`,
    transform: isHovered ? "translateY(-8px) scale(1.03)" : "scale(1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
  };

  // Add a subtle inner glow effect on hover
  const innerGlowStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "13px", // Slightly less than card border-radius
    boxShadow: isHovered ? `inset 0 0 15px ${colorHex}40` : "none",
    pointerEvents: "none",
    transition: "box-shadow 0.3s ease",
  };

  const imageContainer = {
    height: "250px",
    backgroundColor: "#f8f9fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  };

  const imageStyle = {
    height: "100%",
    width: "100%",
    objectFit: "contain",
    transition: "transform 0.4s ease",
    transform: isHovered ? "scale(1.1)" : "scale(1)",
  };

  return (
    <Col>
      <Link
        to={`/product/${product.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card style={cardStyle} className="h-100">
          {/* Inner glow effect */}
          <div style={innerGlowStyle} />
          
          <div style={imageContainer}>
            <Card.Img
              variant="top"
              src={
                product.images ||
                product.image ||
                "https://via.placeholder.com/250x300.png?text=No+Image"
              }
              alt={product.name || "Unnamed Jewellery"}
              style={imageStyle}
            />
          </div>
          <Card.Body className="p-3 text-center">
            <Card.Title className="fs-6 fw-semibold text-dark text-truncate">
              {product.name || "Unnamed Jewellery"}
            </Card.Title>
            <Card.Text className="text-secondary small mb-2">
              Color:{" "}
              <strong
                style={{ 
                  color: colorHex,
                  backgroundColor: `${colorHex}15`,
                  padding: "2px 10px",
                  borderRadius: "12px",
                  display: "inline-block",
                  border: `1px solid ${colorHex}30`
                }}
              >
                {productColor}
              </strong>
            </Card.Text>
            <Card.Text className="text-success fw-bold fs-5">
              ₹{product.price || "N/A"}
            </Card.Text>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  );
};

// -------------------------------------------------------------
function Jewellery() {
  const categoryName = "Jewellery";
  const PAGE_SIZE = 8;

  const [products, setProducts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // 🧠 Initial fetch (random start like Stationary)
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        setProducts([]);
        setHasMore(true);

        const productsRef = collection(db, "products");
        const countQuery = query(
          productsRef,
          where("category", "==", categoryName)
        );
        const countSnapshot = await getDocs(countQuery);
        const totalProducts = countSnapshot.docs.length;

        if (totalProducts === 0) {
          setLoading(false);
          setHasMore(false);
          return;
        }

        const maxSkip = totalProducts - PAGE_SIZE;
        const skipCount =
          totalProducts > PAGE_SIZE ? Math.floor(Math.random() * maxSkip) : 0;

        let startDoc = null;
        if (skipCount > 0) {
          const startDocQuery = query(
            productsRef,
            where("category", "==", categoryName),
            orderBy("name"),
            limit(skipCount)
          );
          const startDocSnapshot = await getDocs(startDocQuery);
          startDoc = startDocSnapshot.docs[startDocSnapshot.docs.length - 1];
        }

        let initialQuery = query(
          productsRef,
          where("category", "==", categoryName),
          orderBy("name"),
          limit(PAGE_SIZE)
        );

        if (startDoc) {
          initialQuery = query(
            productsRef,
            where("category", "==", categoryName),
            orderBy("name"),
            startAfter(startDoc),
            limit(PAGE_SIZE)
          );
        }

        const snapshot = await getDocs(initialQuery);
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(fetched);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        if (snapshot.docs.length < PAGE_SIZE || totalProducts <= PAGE_SIZE)
          setHasMore(false);
      } catch (err) {
        console.error(`🔥 Error fetching ${categoryName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, [categoryName]);

  // 🌀 Load More
  const loadMore = useCallback(async () => {
    if (!lastVisible || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const productsRef = collection(db, "products");
      const nextQuery = query(
        productsRef,
        where("category", "==", categoryName),
        orderBy("name"),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(nextQuery);
      const newProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (newProducts.length === 0) {
        setHasMore(false);
        return;
      }

      setProducts((prev) => [...prev, ...newProducts]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error(`Error loading more ${categoryName}:`, err);
    } finally {
      setLoadingMore(false);
    }
  }, [lastVisible, loadingMore, hasMore, categoryName]);

  // 👁️ Infinite Scroll
  const lastProductRef = useCallback(
    (node) => {
      if (loadingMore || loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });
      if (node) observer.current.observe(node);
    },
    [loadMore, hasMore, loadingMore, loading]
  );

  // 🧩 Render
  return (
    <Container className="my-5 text-center">
      <h2 className="fw-bold mb-3" style={{ color: "#333", fontSize: "2rem", letterSpacing: "1px" }}>
        💍 {categoryName} Collection
      </h2>
      <p className="text-muted mb-5">
        Explore our latest <strong>{categoryName.toLowerCase()}</strong> products!
      </p>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3 text-muted">Loading {categoryName}...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {products.map((product, index) => {
              const isLastElement = index === products.length - 1;
              const ref = isLastElement ? lastProductRef : null;
              return (
                <div ref={ref} key={product.id}>
                  <ProductCard product={product} />
                </div>
              );
            })}
          </Row>

          {loadingMore && (
            <div className="text-center my-4">
              <Spinner animation="grow" variant="secondary" />
              <p className="text-muted">Loading more...</p>
            </div>
          )}

          {!hasMore && <p className="text-muted mt-4">🎉 You've reached the end!</p>}
        </>
      ) : (
        <Alert variant="warning" className="p-4">
          <p className="text-warning fw-bold mb-0">No products found in {categoryName}.</p>
        </Alert>
      )}
    </Container>
  );
}

export default Jewellery;