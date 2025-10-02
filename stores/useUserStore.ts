import { create } from 'zustand';
import { User } from '../types';
import { backendService } from '../services/BackendService';

interface UserState {
  users: User[];
  currentUser: User | null;
  fetchUsers: () => void;
  setCurrentUser: (user: User) => void;
  login: (email: string, passwordAttempt: string) => Promise<User | null>;
  logout: () => void;
  addUser: (newUserData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  fetchUsers: () => {
    const users = backendService.getUsers();
    set({ users });
  },
  setCurrentUser: (user: User) => {
      set({ currentUser: user });
  },
  login: async (email, password) => {
    // This is synchronous in the mock backend, but we keep it async for future-proofing
    const user = backendService.authenticateUser(email, password);
    if (user) {
      set({ currentUser: user });
    }
    return user;
  },
  logout: () => {
    set({ currentUser: null });
  },
  addUser: async (newUserData) => {
    const newUser = await backendService.addUser(newUserData);
    set(state => ({ users: [...state.users, newUser] }));
  },
  updateUser: async (updatedUser) => {
    const updated = await backendService.updateUser(updatedUser);
    set(state => ({
      users: state.users.map(u => u.id === updated.id ? updated : u),
      currentUser: get().currentUser?.id === updated.id ? updated : get().currentUser
    }));
  },
  deleteUser: async (userId) => {
    await backendService.deleteUser(userId);
    set(state => ({ users: state.users.filter(u => u.id !== userId) }));
  },
}));
