import { create } from 'zustand';
import { UserSchema } from '@/schemas';
import { z } from 'zod';

type User = z.infer<typeof UserSchema>;

interface UserState {
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
    currentUser: null,
    setCurrentUser: (user) => set({ currentUser: user }),
}));