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

/* 🎨 ELECTRONICS THEME COLORS */
const PRIMARY_TEXT_COLOR = "#0F172A"; // Dark Navy
const ACCENT_COLOR = "#38BDF8";       // Sky Blue
const SALE_RED = "#DC2626";
const LIGHT_BG = "#F1F5F9";
const WHITE = "#FFFFFF";

/* 🎨 STYLES */
const customStyles = {
  mainWrapper: {
    backgroundColor: LIGHT_BG,
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: WHITE,
    borderRadius: "30px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
    border: "1px solid #E2E8F0",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: WHITE,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    cursor: "pointer",
    height: "100%",
    position: "relative",
    boxShadow: "0 5px 15px rgba(0,0,0,0.06)",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "240px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  }),
  productImage: {
    maxWidth: "85%",
    maxHeight: "85%",
    objectFit: "contain",
    transition: "transform 0.5s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "15px",
    left: "15px",
    backgroundColor: SALE_RED,
    color: WHITE,
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#0284C7",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: PRIMARY_TEXT_COLOR,
    marginBottom: "8px",
  },
  price: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: PRIMARY_TEXT_COLOR,
  },
  header: {
    fontSize: "clamp(2rem, 5vw, 2.5rem)",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
  },
  shopButton: {
    borderRadius: "14px",
    fontSize: "0.9rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
    border: "none",
    padding: "0.7rem",
  },
  exploreButton: {
    backgroundColor: "transparent",
    color: PRIMARY_TEXT_COLOR,
    border: `2px solid ${PRIMARY_TEXT_COLOR}`,
    borderRadius: "50px",
    fontSize: "1.1rem",
    padding: "0.8rem 3rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
};

/* ✨ ANIMATIONS */
const ElectronicsAnimations = () => (
  <style>{`
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-in {
      animation: slideUpFade 0.8s ease-out forwards;
    }
    .electronics-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px rgba(14, 165, 233, 0.25) !important;
    }
    .electronics-card:hover img {
      transform: scale(1.1);
    }
    .electronics-btn:hover {
      opacity: 0.9;
      transform: scale(1.05);
    }
    .explore-btn:hover {
      background-color: ${PRIMARY_TEXT_COLOR};
      color: white;
    }
  `}</style>
);

/* 🔢 Discount Calculator */
const calculateDiscount = (p, op) =>
  op > p ? Math.round(((op - p) / op) * 100) : 0;

/* 💻 HOME ELECTRONICS SECTION */
function HomeElectronicsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchElectronics = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", "Electronics")
        );
        const snapshot = await getDocs(q);

        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 4999,
          originalPrice: Number(doc.data().originalPrice) || 7999,
        }));

        setProducts(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (err) {
        setProducts(
          Array.from({ length: 4 }, (_, i) => ({
            id: i,
            name: "Smart Gadget",
            brand: "TECH PRO",
            price: 5999,
            originalPrice: 8999,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElectronics();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <ElectronicsAnimations />

      <Container className="animate-in" style={customStyles.sectionContainer}>
        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            SMART TECH <span style={{ color: ACCENT_COLOR }}>ESSENTIALS</span>
          </h3>
          <p className="text-muted mt-2 d-none d-sm-block">
            Power up your life with cutting-edge electronics.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: PRIMARY_TEXT_COLOR }} />
          </div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4">
              {products.map((product) => {
                const discount = calculateDiscount(
                  product.price,
                  product.originalPrice
                );

                return (
                  <Col key={product.id}>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-decoration-none d-block h-100"
                    >
                      <Card
                        className="electronics-card"
                        style={customStyles.productCard}
                      >
                        {discount > 0 && (
                          <Badge style={customStyles.discountBadge}>
                            {discount}% OFF
                          </Badge>
                        )}

                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                          />
                        </div>

                        <Card.Body className="p-3 d-flex flex-column text-center">
                          <small style={customStyles.brandText}>
                            {product.brand || "TECH PRO"}
                          </small>

                          <Card.Title
                            style={customStyles.title}
                            className="text-truncate"
                          >
                            {product.name}
                          </Card.Title>

                          <div className="mt-auto">
                            <div className="mb-3">
                              <span style={customStyles.price}>
                                ₹{product.price}
                              </span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">
                                  ₹{product.originalPrice}
                                </small>
                              )}
                            </div>

                            <Button
                              style={customStyles.shopButton}
                              className="w-100 electronics-btn"
                            >
                              SHOP NOW
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                );
              })}
            </Row>

            {/* CTA */}
            <div className="text-center mt-5">
              <Link to="/electronics">
                <Button
                  style={customStyles.exploreButton}
                  className="explore-btn"
                >
                  Explore Electronics →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeElectronicsSection;
