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

// 🎨 UPDATED STYLE CONSTANTS (Playful Blue Theme)
const PRIMARY_TEXT_COLOR = "#0D3B66"; // Deep Navy Blue
const ACCENT_COLOR = "#0077B6";      // Bright Sky Blue
const SALE_COLOR = "#FF4D6D";        // Playful Pink/Red for Sale
const WHITE_COLOR = "#FFFFFF";
const LIGHT_BLUE_BG = "#E0F2F1";

// 🎨 CUSTOM STYLES & ANIMATIONS
const customStyles = {
  mainWrapper: {
    background: "linear-gradient(180deg, #F0F9FF 0%, #B9E6FF 100%)",
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "35px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 20px 50px rgba(0, 119, 182, 0.1)",
    border: "2px solid #FFFFFF",
  },
  productCard: {
    border: "none",
    borderRadius: "25px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
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
    backgroundColor: "#F0F8FF",
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
    left: "12px",
    backgroundColor: SALE_COLOR,
    color: WHITE_COLOR,
    padding: "0.5rem 0.8rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "800",
    zIndex: 10,
    boxShadow: "0 4px 10px rgba(255, 77, 109, 0.3)",
    transform: "rotate(-5deg)",
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "800",
    color: ACCENT_COLOR,
    marginBottom: "4px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: PRIMARY_TEXT_COLOR,
    marginBottom: "8px",
  },
  price: {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
  },
  header: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: "900",
    color: PRIMARY_TEXT_COLOR,
    letterSpacing: "-1px",
    animation: "floatHeader 3s ease-in-out infinite",
  },
  viewDealButton: {
    transition: "all 0.3s ease",
    borderRadius: "14px",
    fontSize: "0.9rem",
    fontWeight: "700",
    backgroundColor: ACCENT_COLOR,
    borderColor: ACCENT_COLOR,
    padding: "0.7rem",
    marginTop: "10px",
  },
  exploreButton: {
    backgroundColor: PRIMARY_TEXT_COLOR,
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "1.1rem",
    padding: "0.8rem 3.5rem",
    boxShadow: "0 10px 20px rgba(13, 59, 102, 0.2)",
    transition: "transform 0.3s ease",
  },
};

// Injecting Keyframe Animations
const AnimationGlobalStyles = () => (
  <style>{`
    @keyframes floatHeader {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .toy-card:hover {
      transform: translateY(-15px) rotate(1deg) !important;
      box-shadow: 0 30px 60px rgba(0, 119, 182, 0.2) !important;
    }
    .toy-card:hover img {
      transform: scale(1.15) rotate(-2deg);
    }
    .btn-bounce:hover {
      transform: scale(1.05);
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

const generateDummyProduct = (index) => ({
  id: `toy-blue-${index}`,
  name: `Adventure Set ${index + 1}`,
  brand: "SKY PLAY",
  price: 1299,
  originalPrice: 1999,
  image: `https://picsum.photos/seed/toyblue${index}/300/300`,
});

function HomeToysSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener("resize", handleResize);
    const fetchToys = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Toys"));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        while (data.length < 4) data.push(generateDummyProduct(data.length));
        setProducts(data.slice(0, 4));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => generateDummyProduct(i)));
      } finally {
        setLoading(false);
      }
    };
    fetchToys();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <AnimationGlobalStyles />
      <Container style={customStyles.sectionContainer}>
        {/* Playful Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            TOYS & <span style={{ color: ACCENT_COLOR }}>GAMES</span>
          </h3>
          <p className="text-muted mt-2">Unlock a world of imagination and endless fun!</p>
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
                    <Link to={`/product/${product.id}`} className="text-decoration-none h-100 d-block">
                      <Card style={customStyles.productCard} className="toy-card">
                        {discount > 0 && (
                          <Badge style={customStyles.discountBadge}>-{discount}%</Badge>
                        )}
                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={product.image || product.images?.[0] || "https://placehold.co/300?text=Toy"}
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                          />
                        </div>
                        <Card.Body className="p-3">
                          <p style={customStyles.brandText}>{product.brand || "KIDS ZONE"}</p>
                          <Card.Title style={customStyles.title} className="text-truncate">{product.name}</Card.Title>
                          <div className="d-flex align-items-center mb-2">
                            <span style={customStyles.price}>₹{product.price}</span>
                            {product.originalPrice > product.price && (
                              <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                            )}
                          </div>
                          <Button 
                            className="w-100 border-0" 
                            style={customStyles.viewDealButton}
                            onMouseEnter={(e) => e.target.style.backgroundColor = PRIMARY_TEXT_COLOR}
                            onMouseLeave={(e) => e.target.style.backgroundColor = ACCENT_COLOR}
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
              <Link to="/toys">
                <Button style={customStyles.exploreButton} className="btn-bounce">
                  See All Adventures →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeToysSection;