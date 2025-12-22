import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Badge,
} from "react-bootstrap";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

// 🎨 UPDATED STYLE CONSTANTS (Nature/Green Theme)
const PRIMARY_TEXT_COLOR = "#1B3022";
const ACCENT_COLOR = "#2D6A4F"; // Forest Green
const SOFT_GREEN = "#D8F3DC"; // Mint Green
const SALE_COLOR = "#081C15"; // Dark Green for contrast
const WHITE_COLOR = "#FFFFFF";

// 🎨 CUSTOM STYLES & ANIMATIONS
const customStyles = {
  sectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    padding: "4rem 1.5rem",
    boxShadow: "0 20px 60px rgba(45, 106, 79, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    backgroundColor: WHITE_COLOR,
    cursor: "pointer",
    height: "100%",
    position: "relative",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "240px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SOFT_GREEN,
    padding: "15px",
  }),
  productImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    transition: "transform 0.5s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: ACCENT_COLOR,
    color: WHITE_COLOR,
    padding: "0.4rem 0.8rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 10px rgba(45, 106, 79, 0.3)",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: ACCENT_COLOR,
    marginBottom: "4px",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: PRIMARY_TEXT_COLOR,
    marginBottom: "8px",
    lineHeight: "1.2",
  },
  price: {
    fontSize: "1.3rem",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
    letterSpacing: "-0.5px",
  },
  originalPrice: { fontSize: "0.85rem", color: "#95a5a6", marginLeft: "8px" },
  header: {
    fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
    letterSpacing: "-1.5px",
    display: "inline-block",
    position: "relative",
    animation: "floatTitle 4s ease-in-out infinite",
  },
  viewDealButton: {
    transition: "all 0.3s ease",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "700",
    backgroundColor: ACCENT_COLOR,
    borderColor: ACCENT_COLOR,
    padding: "0.6rem",
    marginTop: "10px",
  },
  exploreButton: {
    backgroundColor: PRIMARY_TEXT_COLOR,
    color: "white",
    borderColor: PRIMARY_TEXT_COLOR,
    transition: "all 0.3s ease-in-out",
    borderRadius: "50px",
    fontSize: "1rem",
    padding: "0.8rem 3rem",
    boxShadow: "0 10px 25px rgba(27, 48, 34, 0.2)",
  },
};

// CSS Injection for Animations
const AnimationStyles = () => (
  <style>{`
    @keyframes floatTitle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .product-card:hover img {
      transform: scale(1.1) rotate(2deg);
    }
    .hover-lift {
      transition: transform 0.3s ease !important;
    }
    .hover-lift:hover {
      transform: translateY(-5px);
    }
  `}</style>
);

// ✨ Hover Handlers
const handleCardMouseEnter = (e) => {
  e.currentTarget.style.transform = "translateY(-12px)";
  e.currentTarget.style.boxShadow = "0 30px 50px rgba(45, 106, 79, 0.15)";
};
const handleCardMouseLeave = (e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = customStyles.productCard.boxShadow;
};
const handleViewDealMouseEnter = (e) => {
  e.currentTarget.style.backgroundColor = SALE_COLOR;
  e.currentTarget.style.borderColor = SALE_COLOR;
  e.currentTarget.style.transform = "scale(1.02)";
};
const handleViewDealMouseLeave = (e) => {
  e.currentTarget.style.backgroundColor = ACCENT_COLOR;
  e.currentTarget.style.borderColor = ACCENT_COLOR;
  e.currentTarget.style.transform = "scale(1)";
};

// 🧠 Helpers
const getProductImageSource = (product) => {
  if (typeof product.image === "string" && product.image.trim() !== "")
    return product.image;
  if (Array.isArray(product.images) && product.images.length > 0)
    return product.images[0];
  return "https://placehold.co/300x380/d8f3dc/1b3022?text=NO+IMAGE";
};

const calculateDiscount = (price, originalPrice) => {
  if (originalPrice > price)
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  return 0;
};

const generateDummyProduct = (index) => ({
  id: `acc-dummy-${index}`,
  name: `Essential Accessory ${index + 1}`,
  brand: "NATURA LUXE",
  price: 899,
  originalPrice: 1599,
  image: `https://picsum.photos/seed/green${index}/300/300`,
});

function HomeAccessoriesSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const cached = localStorage.getItem("accessoriesProducts");
        if (cached) {
          setProducts(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const productsRef = collection(db, "products");
        const q = query(productsRef, where("category", "==", "Accessories"));
        const snapshot = await getDocs(q);

        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 499,
          originalPrice: Number(doc.data().originalPrice) || 999,
        }));

        while (data.length < 4) data.push(generateDummyProduct(data.length));

        data = data.sort(() => 0.5 - Math.random()).slice(0, 4);
        setProducts(data);
        localStorage.setItem("accessoriesProducts", JSON.stringify(data));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => generateDummyProduct(i)));
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, []);

  return (
    <Container fluid style={{ background: "radial-gradient(circle, #f0fff4 0%, #dcfce7 100%)", padding: "60px 0" }}>
      <AnimationStyles />
      <Container style={customStyles.sectionContainer}>
        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            ACCESSORIES <span style={{ color: ACCENT_COLOR }}>COLLECTION</span>
          </h3>
          <p className="text-muted mt-2 fw-light">
            Eco-conscious luxury items to complete your signature look.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="grow" variant="success" />
          </div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4 justify-content-center">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card
                        style={customStyles.productCard}
                        onMouseEnter={handleCardMouseEnter}
                        onMouseLeave={handleCardMouseLeave}
                      >
                        {discount > 0 && (
                          <Badge style={customStyles.discountBadge}>-{discount}%</Badge>
                        )}
                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={getProductImageSource(product)}
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                          />
                        </div>
                        <Card.Body className="text-start p-3 d-flex flex-column">
                          <p style={customStyles.brandText}>{product.brand}</p>
                          <Card.Title style={customStyles.title} className="text-truncate">
                            {product.name}
                          </Card.Title>
                          <div className="d-flex align-items-center mt-auto">
                            <span style={customStyles.price}>₹{product.price}</span>
                            {product.originalPrice > product.price && (
                              <span style={customStyles.originalPrice} className="text-decoration-line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="success"
                            style={customStyles.viewDealButton}
                            onMouseEnter={handleViewDealMouseEnter}
                            onMouseLeave={handleViewDealMouseLeave}
                          >
                            SHOP NOW
                          </Button>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                );
              })}
            </Row>

            <div className="text-center mt-5">
              <Link to="/accessories">
                <Button
                  style={customStyles.exploreButton}
                  className="hover-lift"
                >
                  Explore All Accessories →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </Container>
  );
}

export default HomeAccessoriesSection;