import { create } from 'zustand';
import Swal from 'sweetalert2';
import {
  getAllUsers,
  getUserById,
  createUserAsAdmin,
  updateUser,
  deleteUserFromFirestore,
  updateUserStatus,
  type UserData,
} from '../services/firestoreService';

export type { UserData };

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  eventDate?: string;
}

export interface UpdateUserInput {
  uid: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'pending';
  eventDate?: string;
  password?: string;
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
      const users = await getAllUsers();
      set({ users, loading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengambil data user';
      set({ error: msg, loading: false });
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#C68E2D' });
    }
  },

  getUserById: async (uid: string) => {
    try {
      return await getUserById(uid);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengambil data user';
      set({ error: msg });
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#C68E2D' });
      return null;
    }
  },

  createUser: async (userData: CreateUserInput) => {
    set({ loading: true, error: null });
    try {
      const newUser = await createUserAsAdmin(userData);
      set((state) => ({ users: [newUser, ...state.users], loading: false }));
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal membuat user baru';
      set({ error: msg, loading: false });
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#C68E2D' });
      return false;
    }
  },

  updateUser: async (userData: UpdateUserInput) => {
    set({ loading: true, error: null });
    try {
      const { uid, password, ...data } = userData;
      await updateUser(uid, { ...data, password });
      // Jangan masukkan password ke state lokal
      set((state) => ({
        users: state.users.map((u) => (u.id === uid ? { ...u, ...data } : u)),
        loading: false,
      }));
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengupdate user';
      set({ error: msg, loading: false });
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#C68E2D' });
      return false;
    }
  },

  deleteUser: async (uid: string) => {
    set({ loading: true, error: null });
    try {
      await deleteUserFromFirestore(uid);
      set((state) => ({
        users: state.users.filter((u) => u.id !== uid),
        loading: false,
      }));
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal menghapus user';
      set({ error: msg, loading: false });
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#C68E2D' });
      return false;
    }
  },

  updateUserStatus: async (uid: string, status: 'active' | 'inactive' | 'pending') => {
    set({ loading: true, error: null });
    try {
      await updateUserStatus(uid, status);
      set((state) => ({
        users: state.users.map((u) => (u.id === uid ? { ...u, status } : u)),
        loading: false,
      }));
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengupdate status user';
      set({ error: msg, loading: false });
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#C68E2D' });
      return false;
    }
  },
}));
