import { create } from 'zustand';
import {
  loginWithFirebase,
  logoutFromFirebase,
  getUserById,
  type UserData,
} from '../services/firestoreService';
import {
  getCookie,
  setCookie,
  removeCookie,
} from '../utils/cookieHelper';

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => () => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  initializeAuth: () => {
    const cookieUserData = getCookie();
    if (cookieUserData) {
      set({ isAuthenticated: true, user: cookieUserData, loading: false });
    } else {
      set({ loading: false });
    }
    return () => {};
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const userData = await loginWithFirebase(email, password);
      setCookie(userData);
      set({ isAuthenticated: true, user: userData, loading: false });
      return true;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await logoutFromFirebase();
    } finally {
      removeCookie();
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  refreshUserData: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    try {
      const userData = await getUserById(userId);
      if (userData) {
        setCookie(userData);
        set({ user: userData });
      }
    } catch {
      // silently fail
    }
  },
}));
