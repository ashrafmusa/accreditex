// Import the functions you need from the SDKs you need
// FIX: Use compat library for initialization to resolve missing 'initializeApp' export.
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase project configuration.
// You can get this from the Firebase Console: Project settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyBPkTWdojLlQBG7E9OPWCXPZ_Zzg31YrLg",
  authDomain: "accreditex-79c08.firebaseapp.com",
  projectId: "accreditex-79c08",
  storageBucket: "accreditex-79c08.firebasestorage.app",
  messagingSenderId: "600504438909",
  appId: "1:600504438909:web:5e25200e69243a615e2114",
  measurementId: "G-41932M9TKF"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export the auth and firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);