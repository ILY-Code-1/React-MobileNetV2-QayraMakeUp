import React, { createContext, useContext, useState, type ReactNode } from 'react';
import {
  loginWithFirebase,
  logoutFromFirebase,
  createUserAsAdmin,
  getUserById,
  type UserData,
} from '../services/firestoreService';
import { getCookie, setCookie, removeCookie } from '../utils/cookieHelper';

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(() => getCookie());
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const userData = await loginWithFirebase(email, password);
    setCookie(userData);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const userData = await createUserAsAdmin({
      name,
      email,
      password,
      role: 'user',
    });
    setCookie(userData);
    setUser(userData);
  };

  const logout = async () => {
    await logoutFromFirebase();
    removeCookie();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    const userData = await getUserById(user.id);
    if (userData) {
      setCookie(userData);
      setUser(userData);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
