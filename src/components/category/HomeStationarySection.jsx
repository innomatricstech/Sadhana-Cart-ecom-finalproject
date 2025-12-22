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

// 🎨 UPDATED STYLE CONSTANTS (Stationery/Yellow Theme)
const PRIMARY_TEXT_COLOR = "#432818"; // Deep Chocolate Brown (pairs great with yellow)
const ACCENT_COLOR = "#F4A261";      // Warm Orange-Yellow
const BANANA_YELLOW = "#FFEFAD";     // Soft Light Yellow
const WHITE_COLOR = "#FFFFFF";
const BORDER_COLOR = "#E9C46A";      // Golden Yellow

// 🎨 CUSTOM STYLES & ANIMATIONS
const customStyles = {
  mainWrapper: {
    background: "linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)", // Light Yellow Gradient
    padding: "50px 0",
  },
  sectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    borderRadius: "30px",
    padding: "3rem 1.5rem",
    boxShadow: "0 15px 40px rgba(233, 196, 106, 0.2)",
    border: `1px solid ${WHITE_COLOR}`,
  },
  productCard: {
    border: `2px solid ${BANANA_YELLOW}`,
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.04)",
    transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
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
    backgroundColor: "#FFFDF0",
    padding: "10px",
  }),
  productImage: {
    maxWidth: "90%",
    maxHeight: "90%",
    objectFit: "contain",
    transition: "transform 0.4s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#E76F51", // Burnt Sienna for contrast
    color: WHITE_COLOR,
    padding: "0.4rem 0.6rem",
    borderRadius: "10px",
    fontSize: "0.75rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 8px rgba(231, 111, 81, 0.3)",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#B08968",
    letterSpacing: "1px",
  },
  title: {
    fontSize: "1rem",
    fontWeight: "700",
    color: PRIMARY_TEXT_COLOR,
    lineHeight: "1.3",
  },
  price: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: PRIMARY_TEXT_COLOR,
  },
  header: {
    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
    display: "inline-block",
    position: "relative",
    animation: "headerWiggle 5s ease-in-out infinite",
  },
  viewDealButton: {
    transition: "all 0.3s ease",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "700",
    backgroundColor: PRIMARY_TEXT_COLOR,
    color: WHITE_COLOR,
    border: "none",
    padding: "0.6rem",
  },
  exploreButton: {
    backgroundColor: WHITE_COLOR,
    color: PRIMARY_TEXT_COLOR,
    border: `2px solid ${PRIMARY_TEXT_COLOR}`,
    borderRadius: "50px",
    fontSize: "1rem",
    padding: "0.7rem 2.5rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
};

// Animation Injection
const AnimationStyles = () => (
  <style>{`
    @keyframes headerWiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(1deg); }
      75% { transform: rotate(-1deg); }
    }
    .stationary-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(233, 196, 106, 0.4) !important;
      border-color: ${BORDER_COLOR} !important;
    }
    .stationary-card:hover img {
      transform: scale(1.08) rotate(2deg);
    }
    .btn-hover-grow:hover {
      background-color: ${BORDER_COLOR} !important;
      color: ${PRIMARY_TEXT_COLOR} !important;
      transform: scale(1.05);
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

function HomeStationarySection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchStationary = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Stationery"));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            price: Number(doc.data().price) || 299,
            originalPrice: Number(doc.data().originalPrice) || 599 
        }));
        
        // Use local shuffle for variety
        data = data.sort(() => 0.5 - Math.random()).slice(0, 4);
        setProducts(data);
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => ({
            id: i, name: "Premium Notebook", brand: "STUDIO", price: 499, originalPrice: 899
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchStationary();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <AnimationStyles />
      <Container style={customStyles.sectionContainer}>
        {/* Creative Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            CREATIVE <span style={{ color: BORDER_COLOR }}>STATIONERY</span>
          </h3>
          <p className="text-muted mt-2 fw-light">Organize your thoughts with our curated premium collection.</p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="grow" variant="warning" /></div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card className="stationary-card" style={customStyles.productCard}>
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
                          <small style={customStyles.brandText} className="text-uppercase mb-1">
                            {product.brand || "ESSENTIALS"}
                          </small>
                          <Card.Title style={customStyles.title} className="text-truncate mb-2">
                            {product.name}
                          </Card.Title>
                          <div className="mt-auto">
                            <div className="d-flex align-items-center mb-2">
                              <span style={customStyles.price}>₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                              )}
                            </div>
                            <Button style={customStyles.viewDealButton} className="w-100 btn-hover-grow">
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
              <Link to="/stationary">
                <Button style={customStyles.exploreButton} className="btn-hover-grow">
                  Shop the Collection →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeStationarySection;