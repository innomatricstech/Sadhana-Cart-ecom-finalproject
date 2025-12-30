import React, { useState, useEffect } from "react";
// UI
import { Container, Row, Col, Card, Button, Spinner, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/cartSlice";
// Firestore + Auth
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase";

function CashOnDelivery() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Data from Checkout -> COD page
  const billingDetails = location.state?.billingDetails || {};
  const cartItems = location.state?.cartItems || [];
  const productSkus = location.state?.productSkus || {};
  const totalPrice = location.state?.totalPrice || 0;
  const coordinates = location.state?.coordinates || { lat: null, lng: null };

  // Local state
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showPopup = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const getSellerIdForCartItem = (item) => {
    return (
      item.sellerId ||
      item.sellerid ||
      item.seller ||
      item.vendorId ||
      "default_seller"
    );
  };

  // Save order to sellers/{sellerId}/orders for vendor dashboard visibility
  const saveOrderToSellerCollections = async (orderData, userOrderDocId) => {
    try {
      const productsBySeller = {};
      (orderData.products || []).forEach((product) => {
        const sellerId = product.sellerId || "default_seller";
        if (!productsBySeller[sellerId]) productsBySeller[sellerId] = [];
        productsBySeller[sellerId].push(product);
      });

      for (const [sellerId, sellerProducts] of Object.entries(productsBySeller)) {
        const sellerOrdersRef = collection(db, "sellers", sellerId, "orders");
        const sellerSubtotal = sellerProducts.reduce((t, p) => t + (p.totalAmount || 0), 0);

        await addDoc(sellerOrdersRef, {
          orderId: orderData.orderId,
          userOrderDocId, // Reference to the doc in users/{uid}/orders
          userId: orderData.userId,
          products: sellerProducts,
          totalAmount: sellerSubtotal,
          paymentMethod: orderData.paymentMethod,
          orderStatus: orderData.orderStatus,
          createdAt: serverTimestamp(),
          customerName: orderData.name,
          customerPhone: orderData.phoneNumber,
          address: orderData.address,
          sellerId,
        });
      }
    } catch (err) {
      console.error("Error in saveOrderToSellerCollections:", err);
    }
  };

  const updateSellerDocuments = async (sellerIds, userOrderDocId, orderData) => {
    try {
      for (const sellerId of sellerIds) {
        if (!sellerId) continue;
        const sellerRef = doc(db, "sellers", sellerId);

        const sellerProducts = (orderData.products || []).filter((p) => p.sellerId === sellerId);
        const sellerSubtotal = sellerProducts.reduce((t, p) => t + (p.totalAmount || 0), 0);

        const orderSummary = {
          orderId: orderData.orderId,
          userOrderDocId,
          customerName: orderData.name,
          totalAmount: sellerSubtotal,
          orderDate: serverTimestamp(),
          orderStatus: orderData.orderStatus,
        };

        const sellerSnap = await getDoc(sellerRef);
        if (!sellerSnap.exists()) {
          // Initialize seller doc if it doesn't exist
          await updateDoc(sellerRef, {
            sellerId,
            orders: [],
            totalSales: 0,
            createdAt: serverTimestamp(),
          }).catch(() => {}); 
        }

        await updateDoc(sellerRef, {
          orders: arrayUnion(orderSummary),
          lastOrderDate: serverTimestamp(),
          totalSales: increment(sellerSubtotal),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Error in updateSellerDocuments:", err);
    }
  };

  const saveOrderToFirestore = async (paymentMethod, status = "Pending") => {
    if (!userId) {
      showPopup("Authentication Required", "You must be logged in to place an order.");
      return { success: false };
    }

    try {
      const sellerIdsInOrder = [...new Set((cartItems || []).map((it) => getSellerIdForCartItem(it)))].filter(Boolean);
      
      const products = (cartItems || []).map((item) => {
        const finalSku = productSkus[item.id] || (item.sku !== "N/A" ? item.sku : item.id);
        const sellerId = getSellerIdForCartItem(item);

        return {
          productId: item.id,
          name: item.title || item.name || "Unnamed Product",
          price: item.price || 0,
          quantity: item.quantity || 1,
          sku: finalSku,
          images: item.images || [],
          sellerId,
          totalAmount: (item.price || 0) * (item.quantity || 1),
        };
      });

      const selleridField = sellerIdsInOrder.length === 1 ? sellerIdsInOrder[0] : sellerIdsInOrder;
      const orderId = `ORD-${Date.now()}`;

      const orderData = {
        userId,
        orderId,
        orderStatus: status,
        totalAmount: totalPrice,
        paymentMethod,
        phoneNumber: billingDetails.phone || null,
        createdAt: serverTimestamp(),
        orderDate: serverTimestamp(),
        address: `${billingDetails.address || ""}, ${billingDetails.city || ""}, ${billingDetails.pincode || ""}, Karnataka`,
        latitude: coordinates.lat || null,
        longitude: coordinates.lng || null,
        name: billingDetails.fullName || null,
        sellerid: selleridField, // requested key name
        products,
        shippingCharges: 0,
      };

      // TARGET PATH: /users/{userId}/orders/
      const ordersRef = collection(db, "users", userId, "orders");
      const userOrderDocRef = await addDoc(ordersRef, orderData);

      // Sync with Seller data
      await saveOrderToSellerCollections(orderData, userOrderDocRef.id);
      await updateSellerDocuments(
        Array.isArray(sellerIdsInOrder) ? sellerIdsInOrder : [sellerIdsInOrder], 
        userOrderDocRef.id, 
        orderData
      );

      return { success: true, docId: userOrderDocRef.id, sellerid: selleridField };
    } catch (error) {
      console.error("Error saving order:", error);
      showPopup("Order Error", "Failed to save order details. Please try again.");
      return { success: false };
    }
  };

  const handleFinalOrderPlacement = async () => {
    if (isSaving) return;
    setShowConfirmModal(false);
    setIsSaving(true);

    const result = await saveOrderToFirestore("Cash on Delivery", "Pending");

    if (result && result.success) {
      dispatch(clearCart());
      navigate("/order-confirm", {
        state: {
          paymentMethod: "Cash on Delivery",
          total: formatPrice(totalPrice),
          itemsCount: cartItems.length,
          billingDetails,
          cartItems,
          sellerid: result.sellerid,
          orderDocId: result.docId,
        },
      });
    }
    setIsSaving(false);
  };

  const handleConfirmOrder = () => {
    if (isSaving || !userId) return;
    setShowConfirmModal(true);
  };

  const handleBack = () => {
    navigate("/checkout", { state: { cartItems, billingDetails, productSkus, totalPrice, coordinates } });
  };

  if (!userId || cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2 className="text-danger">Error</h2>
        <p>Order data is missing or you are not logged in.</p>
        <Button onClick={handleBack} variant="primary">Go back to Checkout</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="mb-4 text-center">Cash on Delivery</h2>
          
          <Card className="mb-4 shadow-sm p-4">
            <h5 className="border-bottom pb-2">Delivery Details</h5>
            <p className="mb-1"><strong>{billingDetails.fullName}</strong></p>
            <p className="mb-1 text-muted">{billingDetails.phone}</p>
            <p className="mb-0">{billingDetails.address}, {billingDetails.city} - {billingDetails.pincode}</p>
          </Card>

          <Card className="mb-4 shadow-sm p-4">
            <h5 className="border-bottom pb-2">Order Items</h5>
            {cartItems.map((item, idx) => (
              <div key={idx} className="d-flex justify-content-between mb-2">
                <span>{item.title} x {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total Payable:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </Card>

          <Button 
            variant="warning" 
            className="w-100 py-3 fw-bold" 
            onClick={handleConfirmOrder} 
            disabled={isSaving}
          >
            {isSaving ? <Spinner animation="border" size="sm" /> : "PLACE ORDER"}
          </Button>
        </Col>
      </Row>

      {/* Info Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton><Modal.Title>{modalTitle}</Modal.Title></Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer><Button onClick={handleCloseModal}>Close</Button></Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Order</Modal.Title></Modal.Header>
        <Modal.Body>Place order for {formatPrice(totalPrice)} using Cash on Delivery?</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleFinalOrderPlacement}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CashOnDelivery;