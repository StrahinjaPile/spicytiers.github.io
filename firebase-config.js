// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCewZk_Lqvt1saMUjZcz-_m5p3BItbwC0A",
  authDomain: "spicytiers.firebaseapp.com",
  projectId: "spicytiers",
  storageBucket: "spicytiers.firebasestorage.app",
  messagingSenderId: "994847851057",
  appId: "1:994847851057:web:3929f76d35324c299a0b10",
  measurementId: "G-9G5C3N4XMF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
