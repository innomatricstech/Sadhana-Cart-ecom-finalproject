// src/components/HomeJewellerySection.jsx
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

// 🎨 UPDATED STYLE CONSTANTS (Light Maroon/Rosewood Theme)
const PRIMARY_MAROON = "#800020";    // Classic Maroon
const LIGHT_MAROON = "#FADADD";      // Pale Rose / Light Maroon background
const ACCENT_GOLD = "#D4AF37";       // Gold pairs beautifully with Maroon
const WHITE_COLOR = "#FFFFFF";
const TEXT_DARK = "#3A000C";         // Very deep maroon for text

const customStyles = {
  mainWrapper: {
    backgroundColor: "#F4E1E1", // Soft Dusty Rose / Light Maroon hue
    padding: "60px 0",
  },
  sectionContainer: {
    backgroundColor: WHITE_COLOR,
    borderRadius: "40px",
    padding: "3.5rem 1.5rem",
    boxShadow: "0 25px 50px rgba(128, 0, 32, 0.1)",
    border: "1px solid #E8D5D8",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: WHITE_COLOR,
    transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
    cursor: "pointer",
    height: "100%",
    position: "relative",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  },
  imageContainer: (isMobile) => ({
    width: "100%",
    height: isMobile ? "180px" : "240px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9F9", // Slight pinkish white for the jewelry
  }),
  productImage: {
    maxWidth: "85%",
    maxHeight: "85%",
    objectFit: "contain",
    transition: "transform 0.5s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: PRIMARY_MAROON,
    color: WHITE_COLOR,
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.7rem",
    fontWeight: "800",
    zIndex: 10,
  },
  brandText: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: PRIMARY_MAROON,
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: "8px",
  },
  price: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: PRIMARY_MAROON,
  },
  header: {
    fontSize: "clamp(2rem, 5vw, 2.5rem)",
    fontWeight: "900",
    color: TEXT_DARK,
    letterSpacing: "-0.5px",
  },
  viewDealButton: {
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "700",
    backgroundColor: PRIMARY_MAROON,
    border: "none",
    padding: "0.7rem",
    transition: "all 0.3s ease",
  },
  exploreButton: {
    backgroundColor: "transparent",
    color: PRIMARY_MAROON,
    border: `2.5px solid ${PRIMARY_MAROON}`,
    borderRadius: "50px",
    fontSize: "1.1rem",
    padding: "0.8rem 3.5rem",
    fontWeight: "700",
    transition: "all 0.3s ease",
  },
};

// ✨ CUSTOM ANIMATIONS (CSS-in-JS)
const MaroonAnimations = () => (
  <style>{`
    @keyframes entranceFade {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .jewellery-entrance {
      animation: entranceFade 0.8s ease-out forwards;
    }
    /* Glimmer effect on hover */
    .jewel-card:hover {
      transform: translateY(-12px);
      box-shadow: 0 20px 40px rgba(128, 0, 32, 0.15) !important;
    }
    .jewel-card:hover img {
      transform: scale(1.1);
    }
    /* Soft button pulse */
    .btn-maroon-hover:hover {
      background-color: ${TEXT_DARK} !important;
      box-shadow: 0 8px 20px rgba(58, 0, 12, 0.3);
      transform: scale(1.02);
    }
    .explore-maroon:hover {
      background-color: ${PRIMARY_MAROON} !important;
      color: white !important;
    }
  `}</style>
);

const calculateDiscount = (p, op) => (op > p ? Math.round(((op - p) / op) * 100) : 0);

function HomeJewellerySection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

  useEffect(() => {
    const fetchJewellery = async () => {
      try {
        const q = query(collection(db, "products"), where("category", "==", "Jewellery"));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 4999,
          originalPrice: Number(doc.data().originalPrice) || 7999
        }));
        setProducts(data.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (err) {
        setProducts(Array.from({ length: 4 }, (_, i) => ({
          id: i, name: "Elegant Gold Necklace", brand: "PREMIUM CRAFT", price: 5499, originalPrice: 8999
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchJewellery();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <MaroonAnimations />
      <Container className="jewellery-entrance" style={customStyles.sectionContainer}>
        {/* Header */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            ROYAL <span style={{ color: PRIMARY_MAROON }}>JEWELLERY</span>
          </h3>
          <p className="text-muted mt-2 d-none d-sm-block" style={{ fontStyle: 'italic' }}>
            Curated pieces that define grace and timeless beauty.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: PRIMARY_MAROON }} /></div>
        ) : (
          <>
            <Row xs={2} sm={2} md={3} lg={4} className="g-3 g-md-4">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.originalPrice);
                return (
                  <Col key={product.id}>
                    <Link to={`/product/${product.id}`} className="text-decoration-none d-block h-100">
                      <Card className="jewel-card" style={customStyles.productCard}>
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
                          <small style={customStyles.brandText}>{product.brand || "LUXURY PIECE"}</small>
                          <Card.Title style={customStyles.title} className="text-truncate">{product.name}</Card.Title>
                          <div className="mt-auto">
                            <div className="mb-3">
                              <span style={customStyles.price}>₹{product.price}</span>
                              {product.originalPrice > product.price && (
                                <small className="ms-2 text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                              )}
                            </div>
                            <Button style={customStyles.viewDealButton} className="w-100 btn-maroon-hover">
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
              <Link to="/jewellery">
                <Button style={customStyles.exploreButton} className="explore-maroon">
                  View Full Gallery →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeJewellerySection;