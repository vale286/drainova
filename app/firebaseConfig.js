// app/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBV_YFBsc0d0H33pMrN6_v91yfR3rib4Zg",
  authDomain: "drainova-90467.firebaseapp.com",
  projectId: "drainova-90467",
  storageBucket: "drainova-90467.firebasestorage.app",
  messagingSenderId: "769734268201",
  appId: "1:769734268201:web:180b292ff1bd605bd79338",
  measurementId: "G-J3V3WMCGQ0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);