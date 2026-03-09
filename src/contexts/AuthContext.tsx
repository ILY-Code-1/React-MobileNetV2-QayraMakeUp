import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  loginWithFirebase,
  logoutFromFirebase,
  createUserAsAdmin,
  USERS_COLLECTION,
  type UserData,
} from '../services/firestoreService';

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
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as UserData);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await loginWithFirebase(email, password);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const userData = await createUserAsAdmin({
      name,
      email,
      password,
      role: 'user',
    });
    setUser(userData);
  };

  const logout = async () => {
    await logoutFromFirebase();
    setUser(null);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, auth.currentUser.uid));
    if (userDoc.exists()) {
      setUser({ id: userDoc.id, ...userDoc.data() } as UserData);
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
