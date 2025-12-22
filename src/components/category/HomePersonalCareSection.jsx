import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Button, Badge } from "react-bootstrap";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

// 🎨 UPDATED RED THEME CONSTANTS
const PRIMARY_TEXT_COLOR = "#4a0000"; // Deep Maroon
const ACCENT_COLOR = "#ff4d4d";      // Bright Coral Red
const BG_LIGHT_RED = "#fff5f5";      // Very Light Red/Pinkish Background
const SALE_COLOR = "#e63946";        // Vibrant Red
const WHITE_COLOR = "#FFFFFF";

const customStyles = {
    sectionContainer: {
        backgroundColor: WHITE_COLOR,
        borderRadius: "25px",
        padding: "3rem 1rem",
        boxShadow: "0 15px 50px rgba(230, 57, 70, 0.1)", // Red-tinted shadow
        border: "1px solid #ffe3e3",
    },
    productCard: {
        border: "1px solid #ffe3e3",
        borderRadius: "15px",
        overflow: "hidden",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Bouncy transition
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
        backgroundColor: "#fffafa", // Snow white with a hint of red
    }),
    productImage: {
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
        transition: "transform 0.5s ease",
        padding: "3px",
    },
    discountBadge: {
        position: "absolute",
        top: "8px",
        right: "8px",
        backgroundColor: SALE_COLOR,
        color: WHITE_COLOR,
        padding: "0.25rem 0.6rem",
        borderRadius: "50px",
        fontSize: "0.75rem",
        fontWeight: "900",
        zIndex: 10,
        boxShadow: "0 4px 10px rgba(230, 57, 70, 0.3)",
    },
    brandText: {
        fontSize: "0.75rem",
        fontWeight: "700",
        color: ACCENT_COLOR,
        marginBottom: "1px",
        letterSpacing: "1px",
    },
    title: {
        fontSize: "1rem",
        fontWeight: "700",
        color: PRIMARY_TEXT_COLOR,
        marginBottom: "4px",
    },
    price: {
        fontSize: "1.4rem",
        fontWeight: "900",
        color: SALE_COLOR,
    },
    header: {
        fontSize: "2.5rem",
        fontWeight: "900",
        color: PRIMARY_TEXT_COLOR,
        letterSpacing: "-1px",
        display: "inline-block",
        position: "relative",
        paddingBottom: "12px",
    },
    headerUnderline: {
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "80px",
        height: "4px",
        backgroundColor: SALE_COLOR,
        borderRadius: "10px",
    },
    viewDealButton: {
        transition: "all 0.3s ease",
        borderRadius: "8px",
        fontSize: "0.85rem",
        fontWeight: "800",
        backgroundColor: SALE_COLOR,
        border: "none",
        padding: "0.5rem 0.8rem",
    },
    exploreButton: {
        backgroundColor: PRIMARY_TEXT_COLOR,
        color: "white",
        border: "none",
        borderRadius: "50px",
        fontSize: "1.1rem",
        padding: "0.8rem 3.5rem",
        boxShadow: `0 10px 25px rgba(74, 0, 0, 0.25)`,
        transition: "all 0.3s ease",
    }
};

// 💅 Global Animations via styled-components or standard CSS
const animationStyles = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
    }

    .animate-section {
        animation: fadeInUp 0.8s ease-out forwards;
    }

    .product-card-hover:hover {
        transform: translateY(-10px) !important;
        box-shadow: 0 20px 40px rgba(230, 57, 70, 0.15) !important;
    }

    .explore-btn:hover {
        background-color: ${ACCENT_COLOR} !important;
        transform: scale(1.05);
        box-shadow: 0 10px 25px rgba(255, 77, 77, 0.4) !important;
    }
`;

function HomePersonalCareSection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 576);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "products"), where("category", "==", "Personal Care"));
                const snapshot = await getDocs(q);
                let data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    price: Number(doc.data().price) || 299,
                    originalPrice: Number(doc.data().originalPrice) || 499,
                }));

                // Shuffle and limit to 4
                data = data.sort(() => 0.5 - Math.random()).slice(0, 4);
                setProducts(data);
            } catch (err) {
                console.warn("Using dummies", err);
                setProducts(Array.from({ length: 4 }, (_, i) => ({
                    id: `dummy-${i}`,
                    name: "Organic Rose Water",
                    brand: "GLOW ESSENTIALS",
                    price: 249,
                    originalPrice: 499,
                    image: `https://picsum.photos/seed/redcare${i}/300/300`
                })));
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <Container fluid style={{ backgroundColor: BG_LIGHT_RED, padding: "4rem 0" }}>
            <style>{animationStyles}</style>
            
            <Container className="py-4 animate-section" style={customStyles.sectionContainer}>
                
                <div className="text-center mb-4">
                    <h3 style={customStyles.header}>
                        PERSONAL CARE <span style={{ color: SALE_COLOR }}>REDEFINED</span>
                        <div style={customStyles.headerUnderline}></div>
                    </h3>
                    <p className="text-muted mt-2 d-none d-sm-block fw-light">
                        Indulge in our curated selection of premium red-line beauty essentials.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="grow" variant="danger" />
                    </div>
                ) : (
                    <>
                        <Row xs={2} sm={2} md={3} lg={4} className="g-3">
                            {products.map((product) => {
                                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                                return (
                                    <Col key={product.id}>
                                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                                            <Card className="product-card-hover" style={customStyles.productCard}>
                                                {discount > 0 && (
                                                    <Badge style={customStyles.discountBadge}>-{discount}%</Badge>
                                                )}
                                                
                                                <div style={customStyles.imageContainer(isMobile)}>
                                                    <Card.Img 
                                                        src={product.image || product.images?.[0]} 
                                                        style={customStyles.productImage} 
                                                    />
                                                </div>

                                                <Card.Body className="p-2 p-md-3">
                                                    <p style={customStyles.brandText} className="text-uppercase mb-1">{product.brand}</p>
                                                    <Card.Title style={customStyles.title} className="text-truncate">{product.name}</Card.Title>
                                                    <div className="d-flex align-items-center justify-content-between mt-2">
                                                        <span style={customStyles.price}>₹{product.price}</span>
                                                        <small className="text-muted text-decoration-line-through">₹{product.originalPrice}</small>
                                                    </div>
                                                    <Button style={customStyles.viewDealButton} className="w-100 mt-2">
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
                            <Link to="/personal-care">
                                <Button style={customStyles.exploreButton} className="explore-btn">
                                    Explore Entire Collection →
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </Container>
        </Container>
    );
}

export default HomePersonalCareSection;