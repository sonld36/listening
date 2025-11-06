import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * Zustand store for client-side auth state management
 * Syncs with NextAuth session data
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  clearUser: () => set({ user: null }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

/**
 * Convenience hook for accessing auth state
 */
export const useAuth = () => {
  const { user, setUser, clearUser, updateUser } = useAuthStore();
  return { user, setUser, clearUser, updateUser };
};
