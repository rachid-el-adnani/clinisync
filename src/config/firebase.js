// Firebase Configuration (TEMPORARY - for client demo only)
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: "AIzaSyBnHdDGUFwPz-jGpIe-Q1Qgxrqurv689Cg",
  authDomain: "clinisync-64e8c.firebaseapp.com",
  projectId: "clinisync-64e8c",
  storageBucket: "clinisync-64e8c.firebasestorage.app",
  messagingSenderId: "678132424673",
  appId: "1:678132424673:web:74dda8b888ee77e708fca0",
  measurementId: "G-4E348FBEK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase initialized (DEMO MODE)');

module.exports = { db, firebaseApp: app };

