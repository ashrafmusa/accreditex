import { create } from 'zustand';
import { User, Notification, UserTrainingStatus, CertificateData } from '../types';
import { initialDataService } from '../services/initialData';

interface UserState {
  currentUser: User | null;
  isLoggingIn: boolean;
  notifications: Notification[];
  userTrainingStatuses: { [userId: string]: UserTrainingStatus };
  certificates: CertificateData[];

  initialize: (data: { notifications: Notification[], userTrainingStatuses: { [userId: string]: UserTrainingStatus }, certificates: CertificateData[] }) => void;
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  markNotificationAsRead: (notificationId: string | 'all') => void;
  updateTrainingStatus: (userId: string, trainingId: string, status: 'Not Started' | 'In Progress' | 'Completed', score?: number) => void;
  generateCertificate: (userId: string, trainingId: string, score: number) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoggingIn: false,
  notifications: [],
  userTrainingStatuses: {},
  certificates: [],

  initialize: (data) => set(data),

  setCurrentUser: (user) => set({ currentUser: user, isLoggingIn: false }),

  login: (user) => set({ currentUser: user }),
  
  logout: () => {
    // In a real app with Firebase, this would also call signOut(auth)
    set({ currentUser: null });
  },
  
  markNotificationAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        notificationId === 'all' || n.id === notificationId ? { ...n, read: true } : n
      )
    }));
  },

  updateTrainingStatus: (userId, trainingId, status, score) => {
    const updatedStatus = initialDataService.updateUserTrainingStatus(userId, trainingId, status, score);
    set(state => ({
        userTrainingStatuses: {
            ...state.userTrainingStatuses,
            [userId]: updatedStatus
        }
    }));
  },

  generateCertificate: (userId, trainingId, score) => {
    const { updatedStatus, newCertificate } = initialDataService.generateCertificate(userId, trainingId, score);
     set(state => ({
        userTrainingStatuses: {
            ...state.userTrainingStatuses,
            [userId]: updatedStatus
        },
        certificates: [...state.certificates, newCertificate]
    }));
  }
}));
