// src/components/HomeMensSection.jsx
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

// 🎨 UPDATED STYLE CONSTANTS (Light Peach Theme)
const PEACH_BG = "#FFF5EE";          // Seashell / Very Light Peach
const ACCENT_PEACH = "#FFDAB9";      // Peach Puff
const DARK_PEACH = "#FF8C69";        // Salmon / Darker Peach for accents
const TEXT_BROWN = "#5D4037";        // Warm brown for better readability on peach
const WHITE_COLOR = "#FFFFFF";

const customStyles = {
  mainWrapper: {
    backgroundColor: PEACH_BG,
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: WHITE_COLOR,
    borderRadius: "30px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 40px rgba(255, 140, 105, 0.1)", // Peach tinted shadow
    border: "1px solid #FFE4E1",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: WHITE_COLOR,
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    cursor: "pointer",
    height: "100%",
    position: "relative",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.03)",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "240px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFAF0", // Floral White (Peach-ish tint)
  }),
  productImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    transition: "transform 0.6s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: DARK_PEACH,
    color: WHITE_COLOR,
    padding: "0.4rem 0.8rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 10px rgba(255, 140, 105, 0.4)",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: DARK_PEACH,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1rem",
    fontWeight: "700",
    color: TEXT_BROWN,
    marginBottom: "6px",
  },
  price: {
    fontSize: "1.3rem",
    fontWeight: "900",
    color: "#2D2D2D",
  },
  header: {
    fontSize: "clamp(2rem, 5vw, 2.6rem)",
    fontWeight: "900",
    color: TEXT_BROWN,
    letterSpacing: "-1px",
  },
  viewDealButton: {
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "700",
    backgroundColor: DARK_PEACH,
    border: "none",
    padding: "0.7rem",
    transition: "all 0.3s ease",
  },
  exploreButton: {
    backgroundColor: "transparent",
    color: TEXT_BROWN,
    border: `2px solid ${DARK_PEACH}`,
    borderRadius: "50px",
    fontSize: "1.1rem",
    padding: "0.8rem 3.5rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
};

// ✨ PEACH THEME ANIMATIONS
const PeachAnimations = () => (
  <style>{`
    @keyframes fadeInSlide {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .peach-entrance {
      animation: fadeInSlide 0.8s ease-out forwards;
    }
    .mens-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(255, 140, 105, 0.2) !important;
    }
    .mens-card:hover img {
      transform: scale(1.08);
    }
    .btn-peach-hover:hover {
      background-color: ${TEXT_BROWN} !important;
      transform: scale(1.02);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .explore-peach:hover {
      background-color: ${DARK_PEACH} !important;
      color: white !important;
      box-shadow: 0 8px 20px rgba(255, 140, 105, 0.3);
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

function HomeMensSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchMens = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Mens"));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 1299,
          originalPrice: Number(doc.data().originalPrice) || 1999
        }));
        setProducts(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => ({
          id: i, name: "Casual Peach Linen Shirt", brand: "MODERN MAN", price: 1499, originalPrice: 2199
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchMens();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <PeachAnimations />
      <Container className="peach-entrance" style={customStyles.sectionContainer}>
        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            MENS <span style={{ color: DARK_PEACH }}>ESSENTIALS</span>
          </h3>
          <p className="text-muted mt-1 fw-light">
            Modern cuts and warm tones for the contemporary man.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: DARK_PEACH }} /></div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card className="mens-card" style={customStyles.productCard}>
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
                          <small style={customStyles.brandText}>{product.brand || "URBAN WEAR"}</small>
                          <Card.Title style={customStyles.title} className="text-truncate mt-1">
                            {product.name}
                          </Card.Title>
                          <div className="mt-auto">
                            <div className="mb-2">
                              <span style={customStyles.price}>₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                              )}
                            </div>
                            <Button style={customStyles.viewDealButton} className="w-100 btn-peach-hover">
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
              <Link to="/mens">
                <Button style={customStyles.exploreButton} className="explore-peach">
                  Explore Full Collection →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeMensSection;