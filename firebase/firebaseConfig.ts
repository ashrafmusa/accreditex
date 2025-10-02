// Import the functions you need from the SDKs you need
// FIX: Use compat library for initialization to resolve missing 'initializeApp' export.
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase project configuration.
// You can get this from the Firebase Console: Project settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "accreditex-79c08.firebaseapp.com",
  projectId: "accreditex-79c08",
  storageBucket: "accreditex-79c08.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Export the auth and firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);