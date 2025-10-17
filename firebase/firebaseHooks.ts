import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { useUserStore } from '../stores/useUserStore';
import { User } from '../types';

export function useFirebaseAuth() {
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const logout = useUserStore(state => state.logout);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in.
        // Fetch the user's profile from Firestore to get their role and other app-specific data.
        // Assumes you have a 'users' collection where the document ID is the user's Firebase UID.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          setCurrentUser(userData);
        } else {
          // This case should ideally not happen if user profiles are created upon sign-up.
          // Handle it by logging out the user to prevent an inconsistent state.
          console.error("User document not found in Firestore for UID:", firebaseUser.uid);
          logout();
        }
      } else {
        // User is signed out.
        logout();
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setCurrentUser, logout]);
}
