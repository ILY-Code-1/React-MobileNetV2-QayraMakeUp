import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email?: string;
    name?: string;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (email: string, password: string) => {
    // Mock authentication - replace with actual API call
    if (email && password) {
      set({
        isAuthenticated: true,
        user: { email, name: 'Admin User' },
      });
      return true;
    }
    return false;
  },
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },
}));
