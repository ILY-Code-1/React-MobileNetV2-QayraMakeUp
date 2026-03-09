import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  loginWithFirebase,
  logoutFromFirebase,
  USERS_COLLECTION,
  type UserData,
} from '../services/firestoreService';

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => () => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as UserData;
            set({ isAuthenticated: true, user: userData, loading: false });
          } else {
            set({ isAuthenticated: false, user: null, loading: false });
          }
        } catch {
          set({ isAuthenticated: false, user: null, loading: false });
        }
      } else {
        set({ isAuthenticated: false, user: null, loading: false });
      }
    });
    return unsubscribe;
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const userData = await loginWithFirebase(email, password);
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
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  refreshUserData: async () => {
    if (!auth.currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as UserData;
        set({ user: userData });
      }
    } catch {
      // silently fail
    }
  },
}));
