// firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtraD4VRw_kJsltygAqzKtcYdyfnLeHZk",
  authDomain: "sadhana-cart.firebaseapp.com",
  projectId: "sadhana-cart",
  storageBucket: "sadhana-cart.appspot.com", 
  messagingSenderId: "126398142924",
  appId: "1:126398142924:web:9ff3415ca18ad24b85a569",
  measurementId: "G-GQ40SLFB85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Authentication
const auth = getAuth(app);

// Export all Firebase services and functions
export { 
  db, 
  storage,
  auth,
  // Firestore functions
  collection, 
  getDocs,
  getDoc,
  doc,
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp
};