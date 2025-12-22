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

// 🎨 UPDATED STYLE CONSTANTS (Lavender Theme)
const PRIMARY_TEXT_COLOR = "#2D1B4D"; // Deep Plum
const ACCENT_COLOR = "#7B61FF";      // Soft Purple/Lavender
const SALE_COLOR = "#FF5C8D";        // Soft Rose
const WHITE_COLOR = "#FFFFFF";

// 🎨 CUSTOM STYLES & ANIMATIONS
const customStyles = {
  mainWrapper: {
    background: "linear-gradient(180deg, #F3E5F5 0%, #E8EAF6 100%)", // Light Lavender Gradient
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(15px)",
    borderRadius: "30px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 60px rgba(123, 97, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
    transition: "all 0.4s ease-in-out",
    backgroundColor: WHITE_COLOR,
    cursor: "pointer",
    height: "100%",
    position: "relative",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "220px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F7FF",
    padding: "10px",
  }),
  productImage: {
    maxWidth: "95%",
    maxHeight: "95%",
    objectFit: "contain",
    transition: "transform 0.6s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: SALE_COLOR,
    color: WHITE_COLOR,
    padding: "0.4rem 0.7rem",
    borderRadius: "50px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 12px rgba(255, 92, 141, 0.3)",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: ACCENT_COLOR,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.05rem",
    fontWeight: "600",
    color: PRIMARY_TEXT_COLOR,
    marginBottom: "8px",
  },
  price: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: PRIMARY_TEXT_COLOR,
  },
  header: {
    fontSize: "clamp(2rem, 5vw, 2.8rem)",
    fontWeight: "800",
    color: PRIMARY_TEXT_COLOR,
    letterSpacing: "-0.5px",
    animation: "softPulse 4s infinite ease-in-out",
  },
  viewDealButton: {
    transition: "all 0.3s ease",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "700",
    backgroundColor: ACCENT_COLOR,
    borderColor: ACCENT_COLOR,
    padding: "0.6rem",
  },
  exploreButton: {
    backgroundColor: PRIMARY_TEXT_COLOR,
    color: WHITE_COLOR,
    border: "none",
    borderRadius: "50px",
    fontSize: "1.1rem",
    padding: "0.8rem 3rem",
    boxShadow: "0 10px 25px rgba(45, 27, 77, 0.2)",
    transition: "transform 0.3s ease",
  },
};

// Injection of Animation Keyframes
const LavenderAnimations = () => (
  <style>{`
    @keyframes softPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.02); opacity: 0.9; }
    }
    .frame-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 25px 50px rgba(123, 97, 255, 0.15) !important;
    }
    .frame-card:hover img {
      transform: scale(1.1);
    }
    .btn-hover-effect:hover {
      transform: translateY(-3px) scale(1.02);
      filter: brightness(1.1);
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

function HomePhotoFrameSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Home"));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          price: Number(doc.data().price) || 599,
          originalPrice: Number(doc.data().originalPrice) || 999
        }));
        setProducts(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => ({ 
          id: i, name: "Luxury Frame", brand: "MEMORIES", price: 799, originalPrice: 1299 
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchFrames();
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <LavenderAnimations />
      <Container style={customStyles.sectionContainer}>
        {/* Elegant Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            PRESERVE YOUR <span style={{ color: ACCENT_COLOR }}>MEMORIES</span>
          </h3>
          <p className="text-muted mt-2 d-none d-sm-block">Handcrafted frames designed to make every moment last forever.</p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: ACCENT_COLOR }} /></div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card className="frame-card" style={customStyles.productCard}>
                        {discount > 0 && <Badge style={customStyles.discountBadge}>{discount}% OFF</Badge>}
                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                          />
                        </div>
                        <Card.Body className="p-3 d-flex flex-column text-center">
                          <small style={customStyles.brandText}>{product.brand}</small>
                          <Card.Title style={customStyles.title} className="text-truncate">{product.name}</Card.Title>
                          <div className="mt-auto">
                            <div className="mb-2">
                              <span style={customStyles.price}>₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                              )}
                            </div>
                            <Button style={customStyles.viewDealButton} className="w-100 btn-hover-effect">
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

            <div className="text-center mt-5">
              <Link to="/photoframe">
                <Button style={customStyles.exploreButton} className="btn-hover-effect">
                  Browse All Collections →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomePhotoFrameSection;