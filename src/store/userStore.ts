import { create } from 'zustand';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import Swal from 'sweetalert2';

// Firebase configuration - should match authStore
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
const functions = getFunctions(app);

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  eventDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserInput {
  uid: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'pending';
  eventDate?: string;
}

interface UserState {
  users: UserData[];
  loading: boolean;
  error: string | null;
  getAllUsers: () => Promise<void>;
  getUserById: (uid: string) => Promise<UserData | null>;
  createUser: (userData: CreateUserInput) => Promise<boolean>;
  updateUser: (userData: UpdateUserInput) => Promise<boolean>;
  deleteUser: (uid: string) => Promise<boolean>;
  updateUserStatus: (uid: string, status: 'active' | 'inactive' | 'pending') => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const getAllUsersFunc = httpsCallable(functions, 'getAllUsers');
      const result: HttpsCallableResult = await getAllUsersFunc({});

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const response = result.data as { success: boolean; users?: UserData[] };

        if (response.success && response.users) {
          set({ users: response.users, loading: false });
          return;
        }
      }

      throw new Error('Failed to fetch users');
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage = error.message || 'Gagal mengambil data user';
      set({ error: errorMessage, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#C68E2D',
      });
    }
  },

  getUserById: async (uid: string) => {
    try {
      const getUserByIdFunc = httpsCallable(functions, 'getUserById');
      const result: HttpsCallableResult = await getUserByIdFunc({ uid });

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const response = result.data as { success: boolean; user?: UserData };

        if (response.success && response.user) {
          return response.user;
        }
      }

      throw new Error('Failed to fetch user');
    } catch (error: any) {
      console.error('Error fetching user:', error);
      const errorMessage = error.message || 'Gagal mengambil data user';
      set({ error: errorMessage });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#C68E2D',
      });
      return null;
    }
  },

  createUser: async (userData: CreateUserInput) => {
    set({ loading: true, error: null });
    try {
      const createUserFunc = httpsCallable(functions, 'createUser');
      const result: HttpsCallableResult = await createUserFunc(userData);

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const response = result.data as { success: boolean; message?: string };

        if (response.success) {
          // Refresh users list after creation
          await useUserStore.getState().getAllUsers();
          set({ loading: false });
          return true;
        }
      }

      throw new Error('Failed to create user');
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.message || 'Gagal membuat user baru';
      set({ error: errorMessage, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#C68E2D',
      });
      return false;
    }
  },

  updateUser: async (userData: UpdateUserInput) => {
    set({ loading: true, error: null });
    try {
      const updateUserFunc = httpsCallable(functions, 'updateUser');
      const result: HttpsCallableResult = await updateUserFunc(userData);

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const response = result.data as { success: boolean; message?: string };

        if (response.success) {
          // Update the user in the local state
          set((state) => ({
            users: state.users.map((user) =>
              user.id === userData.uid ? { ...user, ...userData } : user
            ),
            loading: false,
          }));
          return true;
        }
      }

      throw new Error('Failed to update user');
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.message || 'Gagal mengupdate user';
      set({ error: errorMessage, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#C68E2D',
      });
      return false;
    }
  },

  deleteUser: async (uid: string) => {
    set({ loading: true, error: null });
    try {
      const deleteUserFunc = httpsCallable(functions, 'deleteUser');
      const result: HttpsCallableResult = await deleteUserFunc({ uid });

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const response = result.data as { success: boolean; message?: string };

        if (response.success) {
          // Remove user from local state
          set((state) => ({
            users: state.users.filter((user) => user.id !== uid),
            loading: false,
          }));
          return true;
        }
      }

      throw new Error('Failed to delete user');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.message || 'Gagal menghapus user';
      set({ error: errorMessage, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#C68E2D',
      });
      return false;
    }
  },

  updateUserStatus: async (uid: string, status: 'active' | 'inactive' | 'pending') => {
    set({ loading: true, error: null });
    try {
      const updateUserStatusFunc = httpsCallable(functions, 'updateUserStatus');
      const result: HttpsCallableResult = await updateUserStatusFunc({ uid, status });

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const response = result.data as { success: boolean; message?: string };

        if (response.success) {
          // Update the user in the local state
          set((state) => ({
            users: state.users.map((user) =>
              user.id === uid ? { ...user, status } : user
            ),
            loading: false,
          }));
          return true;
        }
      }

      throw new Error('Failed to update user status');
    } catch (error: any) {
      console.error('Error updating user status:', error);
      const errorMessage = error.message || 'Gagal mengupdate status user';
      set({ error: errorMessage, loading: false });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#C68E2D',
      });
      return false;
    }
  },
}));
