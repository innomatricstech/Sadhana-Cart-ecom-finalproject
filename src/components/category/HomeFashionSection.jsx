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

// 🎨 STYLE CONSTANTS (Updated for Pink Theme)
const PRIMARY_TEXT_COLOR = "#2d2d2d";
const ACCENT_COLOR = "#d63384"; // Deep Pink/Magenta Accent
const SALE_COLOR = "#c71585";    // Medium Violet Red
const WHITE_COLOR = "#FFFFFF";
const PRODUCT_BG_COLOR = "#fffafb"; // Very light pink-white for cards
const PINK_BG_GRADIENT = "linear-gradient(135deg, #fff0f3 0%, #f7d9e3 100%)";

// 🎨 CUSTOM STYLES
const customStyles = {
  sectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(15px)",
    borderRadius: "30px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 60px rgba(214, 51, 132, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    position: "relative",
    overflow: "hidden"
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(214, 51, 132, 0.05)",
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
    backgroundColor: PRODUCT_BG_COLOR,
    padding: "10px",
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
    borderRadius: "50px",
    fontSize: "0.7rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 12px rgba(214, 51, 132, 0.3)",
    letterSpacing: "0.5px",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#a86d8d",
    marginBottom: "4px",
    letterSpacing: "1px",
    textTransform: "uppercase"
  },
  title: {
    fontSize: "1rem",
    fontWeight: "700",
    color: PRIMARY_TEXT_COLOR,
    marginBottom: "8px",
    lineHeight: "1.3"
  },
  price: {
    fontSize: "1.35rem",
    fontWeight: "900",
    color: ACCENT_COLOR,
    letterSpacing: "-0.5px",
  },
  originalPrice: { 
    fontSize: "0.85rem", 
    color: "#adb5bd",
    marginLeft: "8px"
  },
  header: {
    fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
    letterSpacing: "-1px",
    position: "relative",
    zIndex: 2
  },
  headerUnderline: {
    position: "absolute",
    bottom: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "120px",
    height: "15px",
    backgroundColor: "rgba(214, 51, 132, 0.1)",
    zIndex: -1,
    borderRadius: "4px",
  },
  viewDealButton: {
    transition: "all 0.3s ease",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "700",
    backgroundColor: ACCENT_COLOR,
    borderColor: ACCENT_COLOR,
    padding: "0.6rem 1rem",
    marginTop: "12px",
    color: WHITE_COLOR
  },
  viewDealButtonHover: {
    backgroundColor: PRIMARY_TEXT_COLOR,
    borderColor: PRIMARY_TEXT_COLOR,
    transform: "translateY(-2px)",
    boxShadow: `0 8px 20px rgba(0, 0, 0, 0.15)`,
  },
  exploreButton: {
    backgroundColor: PRIMARY_TEXT_COLOR,
    color: WHITE_COLOR,
    border: "none",
    transition: "all 0.3s ease-in-out",
    borderRadius: "50px",
    fontSize: "1rem",
    padding: "0.8rem 3rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  exploreButtonHover: {
    backgroundColor: ACCENT_COLOR,
    transform: "translateY(-3px)",
    boxShadow: `0 10px 25px rgba(214, 51, 132, 0.4)`,
  },
  pinkWatermark: {
    position: "absolute",
    bottom: "-30px",
    left: "-20px",
    fontSize: "12rem",
    fontWeight: "900",
    color: "rgba(214, 51, 132, 0.03)",
    userSelect: "none",
    pointerEvents: "none"
  }
};

// 🧠 Utility Functions
const handleCardMouseEnter = (e) => {
  e.currentTarget.style.transform = "translateY(-12px)";
  e.currentTarget.style.boxShadow = "0 25px 50px rgba(214, 51, 132, 0.12)";
  e.currentTarget.querySelector("img").style.transform = "scale(1.08)";
};
const handleCardMouseLeave = (e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = customStyles.productCard.boxShadow;
  e.currentTarget.querySelector("img").style.transform = "scale(1)";
};
const handleViewDealMouseEnter = (e) =>
  Object.assign(e.currentTarget.style, customStyles.viewDealButtonHover);
const handleViewDealMouseLeave = (e) =>
  Object.assign(e.currentTarget.style, {
    ...customStyles.viewDealButton,
    transform: "none",
    boxShadow: "none",
  });
const handleExploreMouseEnter = (e) =>
  Object.assign(e.currentTarget.style, customStyles.exploreButtonHover);
const handleExploreMouseLeave = (e) =>
  Object.assign(e.currentTarget.style, {
    ...customStyles.exploreButton,
    transform: "none",
    boxShadow: customStyles.exploreButton.boxShadow,
  });

const getProductImageSource = (product) => {
  if (typeof product.image === "string" && product.image.trim() !== "")
    return product.image;
  if (Array.isArray(product.images) && product.images.length > 0)
    return product.images[0];
  return "https://placehold.co/300x380/fce4ec/ad1457?text=NO+IMAGE";
};
const calculateDiscount = (price, originalPrice) => {
  if (originalPrice > price)
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  return 0;
};
const generateDummyProduct = (index) => {
  const basePrice = Math.floor(Math.random() * 800) + 1500;
  const discountFactor = Math.random() * 0.5 + 0.3;
  const finalPrice = Math.floor(basePrice * discountFactor);
  const originalPrice =
    basePrice <= finalPrice
      ? finalPrice + Math.floor(Math.random() * 500) + 500
      : basePrice;
  return {
    id: `fashion-pink-${index}`,
    name: `Premium Look ${index + 1}`,
    brand: "CHIC VIBE",
    price: finalPrice,
    originalPrice,
    image: `https://picsum.photos/seed/pinkfashion${index}/300/300`,
  };
};

function HomeFashionSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFashion = async () => {
      setLoading(true);
      try {
        const cached = localStorage.getItem("fashionProductsPink");
        if (cached) {
          setProducts(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const categoryName = "Fashion";
        const productLimit = 4;
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("category", "==", categoryName));
        const snapshot = await getDocs(q);

        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          price: doc.data().price ? Number(doc.data().price) : 499,
          originalPrice: doc.data().originalPrice
            ? Number(doc.data().originalPrice)
            : 999,
        }));

        while (data.length < productLimit)
          data.push(generateDummyProduct(data.length));

        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }

        data = data.slice(0, productLimit);
        setProducts(data);
        localStorage.setItem("fashionProductsPink", JSON.stringify(data));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => generateDummyProduct(i)));
      } finally {
        setLoading(false);
      }
    };
    fetchFashion();
  }, []);

  return (
    <Container fluid style={{ background: PINK_BG_GRADIENT, padding: "70px 0" }}>
      <Container style={customStyles.sectionContainer}>
        <div style={customStyles.pinkWatermark}>CHIC</div>

        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            FASHION <span style={{ color: ACCENT_COLOR }}>COLLECTION</span>
            <div style={customStyles.headerUnderline}></div>
          </h3>
          <p className="text-muted mt-3 fs-6 fw-light d-none d-sm-block">
            Elevate your wardrobe with our latest high-fashion arrivals.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: ACCENT_COLOR }} />
            <p className="mt-3 text-muted">Styling your feed...</p>
          </div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-lg-4 justify-content-center">
              {products.map((product) => {
                const discountPercent = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card
                        style={customStyles.productCard}
                        onMouseEnter={handleCardMouseEnter}
                        onMouseLeave={handleCardMouseLeave}
                      >
                        {discountPercent > 0 && (
                          <Badge style={customStyles.discountBadge}>
                            -{discountPercent}%
                          </Badge>
                        )}
                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={getProductImageSource(product)}
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                            onError={(e) => (e.target.src = "https://placehold.co/300x380/fce4ec/ad1457?text=Error")}
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
                            variant="primary"
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
              <Link to="/fashion">
                <Button
                  style={customStyles.exploreButton}
                  onMouseEnter={handleExploreMouseEnter}
                  onMouseLeave={handleExploreMouseLeave}
                >
                  Explore All Fashion →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </Container>
  );
}

export default HomeFashionSection;