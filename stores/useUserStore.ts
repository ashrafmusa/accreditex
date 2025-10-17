import { create } from 'zustand';
import { User } from '../types';
import { dataService } from '../services/data';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

interface UserState {
  users: User[];
  currentUser: User | null;
  fetchUsers: () => void;
  setCurrentUser: (user: User) => void;
  login: (email: string, passwordAttempt: string) => Promise<User | null>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  fetchUsers: async () => {
    const users = dataService.getUsers();
    set({ users });
  },
  setCurrentUser: (user: User) => {
    set({ currentUser: user });
  },
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // The auth state listener in useFirebaseAuth will handle setting the user.
      // We can return the user from the store after the listener has run.
      // A small delay helps ensure the state propagates from the listener.
      await new Promise(resolve => setTimeout(resolve, 100));
      return get().currentUser;
    } catch (error) {
      console.error("Firebase login failed:", error);
      return null;
    }
  },
  logout: () => {
    signOut(auth);
    set({ currentUser: null });
  },

}));