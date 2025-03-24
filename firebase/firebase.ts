// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBg09TJw5nm3G_dUEhh6ZUUWMFvH7fM0-Y",
  authDomain: "perfectpitch-316a3.firebaseapp.com",
  projectId: "perfectpitch-316a3",
  storageBucket: "perfectpitch-316a3.appspot.com",
  messagingSenderId: "196667934989",
  appId: "1:196667934989:web:05e333f984d9fcc16b4844",
  measurementId: "G-EF4SH1F3YW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


