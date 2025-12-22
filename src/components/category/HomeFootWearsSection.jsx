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

// 🎨 UPDATED STYLE CONSTANTS (Warm Earthy Theme)
const PRIMARY_TEXT_COLOR = "#3E2723"; // Deep Coffee Brown
const ACCENT_COLOR = "#A1887F";      // Warm Taupe
const EARTH_BROWN = "#8D6E63";       // Medium Terra
const LIGHT_SAND = "#FDF5E6";        // Old Lace / Light Brown
const WHITE_COLOR = "#FFFFFF";

const customStyles = {
  mainWrapper: {
    backgroundColor: "#F5F5DC", // Beige/Light Brown background
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: WHITE_COLOR,
    borderRadius: "30px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 40px rgba(62, 39, 35, 0.08)",
    border: "1px solid #EFEBE9",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: WHITE_COLOR,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    cursor: "pointer",
    height: "100%",
    position: "relative",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "240px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF9F6", // Off-white for shoe contrast
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
    backgroundColor: "#D84315", // Burnt Orange for Sale
    color: WHITE_COLOR,
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: EARTH_BROWN,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.1rem",
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
    letterSpacing: "-0.5px",
  },
  viewDealButton: {
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "700",
    backgroundColor: PRIMARY_TEXT_COLOR,
    border: "none",
    padding: "0.7rem",
    transition: "all 0.3s ease",
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

// 🌟 CSS ANIMATIONS
const BrownAnimations = () => (
  <style>{`
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-in {
      animation: slideUpFade 0.8s ease-out forwards;
    }
    .footwear-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px rgba(62, 39, 35, 0.15) !important;
    }
    .footwear-card:hover img {
      transform: scale(1.1) rotate(2deg);
    }
    .hover-btn-brown:hover {
      background-color: ${EARTH_BROWN} !important;
      transform: scale(1.05);
    }
    .explore-btn-hover:hover {
      background-color: ${PRIMARY_TEXT_COLOR} !important;
      color: white !important;
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

function HomeFootWearsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchFootwears = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Footwears"));
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
          id: i, name: "Classic Loafer", brand: "OAK & LEATHER", price: 1899, originalPrice: 2999
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchFootwears();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <BrownAnimations />
      <Container className="animate-in" style={customStyles.sectionContainer}>
        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            WALK WITH <span style={{ color: EARTH_BROWN }}>CONFIDENCE</span>
          </h3>
          <p className="text-muted mt-2 d-none d-sm-block">Premium footwear crafted for comfort and lasting style.</p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: PRIMARY_TEXT_COLOR }} /></div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card className="footwear-card" style={customStyles.productCard}>
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
                          <small style={customStyles.brandText}>{product.brand || "HANDCRAFTED"}</small>
                          <Card.Title style={customStyles.title} className="text-truncate">{product.name}</Card.Title>
                          <div className="mt-auto">
                            <div className="mb-3">
                              <span style={customStyles.price}>₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                              )}
                            </div>
                            <Button style={customStyles.viewDealButton} className="w-100 hover-btn-brown">
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
              <Link to="/footwears">
                <Button style={customStyles.exploreButton} className="explore-btn-hover">
                  Explore Collection →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeFootWearsSection;