import { create } from 'zustand';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const db = getFirestore(app);

interface User {
  uid?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'pending';
  eventDate?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
  refreshUserData: () => Promise<void>;
}

// Function to fetch user data from Firestore
const fetchUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users_qayra', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: uid,
        email: data.email,
        name: data.name,
        role: data.role,
        status: data.status,
        eventDate: data.eventDate,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user data from Firestore
      const userData = await fetchUserData(firebaseUser.uid);

      if (userData) {
        set({
          isAuthenticated: true,
          user: userData,
          loading: false,
        });
        return true;
      } else {
        // User authenticated but no Firestore data
        set({
          isAuthenticated: true,
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || undefined,
          },
          loading: false,
        });
        return true;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      set({ loading: false });
      throw new Error(error.message || 'Login failed');
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        set({
          isAuthenticated: true,
          user: userData || {
            uid: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || undefined,
          },
          loading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    });
  },

  refreshUserData: async () => {
    const { user } = get();
    if (user?.uid) {
      const userData = await fetchUserData(user.uid);
      if (userData) {
        set({ user: userData });
      }
    }
  },
}));
