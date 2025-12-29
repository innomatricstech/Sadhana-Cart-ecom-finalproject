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
import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

/* 📚 BOOK THEME COLORS */
const PRIMARY_TEXT_COLOR = "#1E293B";
const ACCENT_COLOR = "#F59E0B";
const SALE_RED = "#DC2626";
const LIGHT_BG = "#FFFBEB";
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
    boxShadow: "0 20px 40px rgba(30, 41, 59, 0.08)",
    border: "1px solid #FEF3C7",
  },
  productCard: {
    border: "none",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: WHITE,
    transition: "all 0.4s ease",
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
    backgroundColor: "#FEFCE8",
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
    color: "#92400E",
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
    background: "linear-gradient(135deg, #F59E0B, #D97706)",
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
  },
};

/* 🔢 Discount Calculator */
const calculateDiscount = (price, originalPrice) =>
  originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

/* 📚 HOME BOOK SECTION */
function HomeBookSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = window.innerWidth <= 576;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("category", "==", "Books"),
          limit(4)
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          price: Number(doc.data().price) || 499,
          originalPrice: Number(doc.data().originalPrice) || 799,
        }));

        setProducts(data);
      } catch (error) {
        console.error("Book fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div style={customStyles.mainWrapper}>
      <Container style={customStyles.sectionContainer}>
        {/* HEADER */}
        <div className="text-center mb-5">
          <h3 style={customStyles.header}>
            READ & <span style={{ color: ACCENT_COLOR }}>GROW</span>
          </h3>
          <p className="text-muted mt-2 d-none d-sm-block">
            Discover books that inspire knowledge and imagination.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
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
                      <Card style={customStyles.productCard}>
                        {discount > 0 && (
                          <Badge style={customStyles.discountBadge}>
                            {discount}% OFF
                          </Badge>
                        )}

                        <div style={customStyles.imageContainer(isMobile)}>
                          <LazyLoadImage
                            src={
                              product.image ||
                              product.images ||
                              "https://via.placeholder.com/250x300"
                            }
                            alt={product.name}
                            effect="blur"
                            style={customStyles.productImage}
                          />
                        </div>

                        <Card.Body className="p-3 text-center">
                          <small style={customStyles.brandText}>
                            {product.brand || "BOOK HOUSE"}
                          </small>

                          <Card.Title
                            style={customStyles.title}
                            className="text-truncate"
                          >
                            {product.name}
                          </Card.Title>

                          <div>
                            <span style={customStyles.price}>
                              ₹{product.price}
                            </span>
                          </div>

                          <Button
                            style={customStyles.shopButton}
                            className="w-100 mt-3"
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

            {/* CTA */}
            <div className="text-center mt-5">
              <Link to="/category/books">
                <Button style={customStyles.exploreButton}>
                  Explore Books →
                </Button>
              </Link>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}

export default HomeBookSection;
