import { create } from 'zustand';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean, userId?: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: true,
  isAuthenticated: false,
  userId: null,
  setLoading: (isLoading) => set({ isLoading }),
  setAuthenticated: (isAuthenticated, userId = null) =>
    set({ isAuthenticated, userId, isLoading: false }),
  reset: () => set({ isAuthenticated: false, userId: null, isLoading: false }),
}));
