import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { useUserStore } from '../stores/useUserStore';
import { User, UserRole } from '../types';

export function useFirebaseAuth() {
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const logout = useUserStore(state => state.logout);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const raw = userDocSnap.data() as Partial<User>;
          const userData: User = {
            id: raw.id || firebaseUser.uid,
            name: raw?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            email: raw?.email || firebaseUser.email || '',
            role: raw?.role || UserRole.TeamMember,
            departmentId: raw?.departmentId,
            jobTitle: raw?.jobTitle,
            hireDate: raw?.hireDate,
            competencies: raw?.competencies || [],
            trainingAssignments: raw?.trainingAssignments || [],
            readAndAcknowledge: raw?.readAndAcknowledge || []
          };
          setCurrentUser(userData);
        } else {
          // Fallback to a minimal user constructed from Firebase auth, so the app remains usable.
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            email: firebaseUser.email || '',
            role: UserRole.TeamMember,
            competencies: [],
            trainingAssignments: [],
          };
          setCurrentUser(fallbackUser);
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
