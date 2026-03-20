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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  initializeAuth: () => {
    // First, try to restore from cookie as fallback
    const cookieUserData = getCookie();
    if (cookieUserData) {
      set({ isAuthenticated: true, user: cookieUserData, loading: false });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as UserData;

            // Only update if different from cookie data
            set((state) => {
              if (!state.user || state.user.id !== userData.id) {
                // Save to cookie
                setCookie(userData);
                return { isAuthenticated: true, user: userData, loading: false };
              }
              return state;
            });
          } else {
            set({ isAuthenticated: false, user: null, loading: false });
            removeCookie();
          }
        } catch (error) {
          // If cookie exists, keep using it
          if (cookieUserData) {
            return;
          }
          set({ isAuthenticated: false, user: null, loading: false });
          removeCookie();
        }
      } else {
        // If cookie exists, keep using it until Firebase ready
        if (cookieUserData) {
          return;
        }
        set({ isAuthenticated: false, user: null, loading: false });
        removeCookie();
      }
    });
    return unsubscribe;
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const userData = await loginWithFirebase(email, password);
      set({ isAuthenticated: true, user: userData, loading: false });
      // Save to cookie
      setCookie(userData);
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
      // Remove from cookie
      removeCookie();
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
