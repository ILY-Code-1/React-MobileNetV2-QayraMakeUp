import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email?: string;
    name?: string;
    isAdmin?: boolean;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (email: string, password: string) => {
    // Mock authentication - replace with actual API call
    // Hardcoded role for demo purposes
    const isAdmin = email === 'admin@qayra.com' && password === 'admin123';

    if (email && password) {
      const userData = {
        email,
        name: isAdmin ? 'Admin Qayra' : 'User',
        isAdmin,
      };

      set({
        isAuthenticated: true,
        user: userData,
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
