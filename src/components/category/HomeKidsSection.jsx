// src/components/HomeKidsSection.jsx
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

// 🎨 UPDATED STYLE CONSTANTS (Light Purple Theme)
const LIGHT_PURPLE_BG = "#F3E5F5";   // Very light lavender
const ACCENT_PURPLE = "#9C27B0";     // Deep purple for accents
const SOFT_PURPLE = "#CE93D8";       // Muted purple for borders/badges
const TEXT_DARK = "#4A148C";         // Dark purple for text
const WHITE_COLOR = "#FFFFFF";

const customStyles = {
  mainWrapper: {
    backgroundColor: LIGHT_PURPLE_BG,
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: WHITE_COLOR,
    borderRadius: "30px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 40px rgba(156, 39, 176, 0.1)", // Purple tinted shadow
    border: "2px solid #E1BEE7",
  },
  productCard: {
    border: "1px solid #F3E5F5",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: WHITE_COLOR,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    cursor: "pointer",
    height: "100%",
    position: "relative",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "230px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF5FF", 
  }),
  productImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    transition: "transform 0.5s ease",
    padding: "10px",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#FF4081", // Playful pinkish-red
    color: WHITE_COLOR,
    padding: "0.4rem 0.8rem",
    borderRadius: "15px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 10px rgba(255, 64, 129, 0.3)",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "800",
    color: ACCENT_PURPLE,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: "5px",
  },
  price: {
    fontSize: "1.3rem",
    fontWeight: "900",
    color: "#E91E63", // Bright pink-purple for price
  },
  header: {
    fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
    fontWeight: "900",
    color: TEXT_DARK,
    letterSpacing: "-1px",
  },
  viewDealButton: {
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "800",
    backgroundColor: ACCENT_PURPLE,
    border: "none",
    padding: "0.75rem",
    transition: "all 0.3s ease",
  },
  exploreButton: {
    backgroundColor: ACCENT_PURPLE,
    color: WHITE_COLOR,
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    padding: "0.8rem 3rem",
    fontWeight: "700",
    boxShadow: "0 10px 20px rgba(156, 39, 176, 0.3)",
    transition: "all 0.3s ease",
  },
};

// ✨ KIDS THEME ANIMATIONS
const KidsAnimations = () => (
  <style>{`
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.9); }
      70% { transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    .kids-section-reveal {
      animation: bounceIn 0.8s ease-out forwards;
    }
    .kids-card:hover {
      transform: translateY(-10px) rotate(1deg);
      border-color: ${SOFT_PURPLE} !important;
      box-shadow: 0 15px 30px rgba(156, 39, 176, 0.2) !important;
    }
    .kids-card:hover img {
      transform: scale(1.1) rotate(-2deg);
    }
    .btn-purple-hover:hover {
      background-color: #7B1FA2 !important;
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(123, 31, 162, 0.4);
    }
    .explore-bounce:hover {
      transform: translateY(-3px) scale(1.03);
      background-color: #4A148C !important;
      box-shadow: 0 12px 25px rgba(156, 39, 176, 0.4);
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

function HomeKidsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Kids"));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 599,
          originalPrice: Number(doc.data().originalPrice) || 1199
        }));
        setProducts(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => ({
          id: i, name: "Super Hero Cotton Tee", brand: "LITTLE CHAMP", price: 699, originalPrice: 1299
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchKids();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <KidsAnimations />
      <Container className="kids-section-reveal" style={customStyles.sectionContainer}>
        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            PLAYFUL <span style={{ color: ACCENT_PURPLE }}>KIDS STYLE</span>
          </h3>
          <p style={{ color: TEXT_DARK, opacity: 0.8 }} className="mt-2 fw-medium">
            Comfortable outfits for every little adventure!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: ACCENT_PURPLE }} /></div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card className="kids-card" style={customStyles.productCard}>
                        {discount > 0 && <Badge style={customStyles.discountBadge}>{discount}% OFF</Badge>}
                        
                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                          />
                        </div>

                        <Card.Body className="p-3 d-flex flex-column">
                          <small style={customStyles.brandText}>{product.brand || "KIDS ZONE"}</small>
                          <Card.Title style={customStyles.title} className="text-truncate my-1">
                            {product.name}
                          </Card.Title>
                          <div className="mt-auto">
                            <div className="mb-2">
                              <span style={customStyles.price}>₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                              )}
                            </div>
                            <Button style={customStyles.viewDealButton} className="w-100 btn-purple-hover">
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
              <Link to="/kids">
                <Button style={customStyles.exploreButton} className="explore-bounce">
                  See More Kids Fashion →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeKidsSection;