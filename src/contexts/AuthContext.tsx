import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  loginUser as apiLogin,
  logoutUser as apiLogout,
  registerUser as apiRegister,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  isAdmin as checkIsAdmin,
  User,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user dari localStorage saat mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);

    if (response.status === 'success' && response.data?.user) {
      setUser(response.data.user);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiRegister({
      name,
      email,
      password,
      role: 'user',
    });

    if (response.status === 'success' && response.data?.user) {
      setUser(response.data.user);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
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
