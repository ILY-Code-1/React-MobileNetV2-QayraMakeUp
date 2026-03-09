import { create } from 'zustand';
import {
  getAllAnalyses,
  getAnalysisByUser,
  saveAnalysis,
  deleteAnalysis as deleteAnalysisFromFirestore,
  type AnalysisData,
} from '../services/firestoreService';

export type { AnalysisData };

interface AnalysisStore {
  analyses: AnalysisData[];
  loading: boolean;
  error: string | null;
  fetchAllAnalyses: () => Promise<void>;
  fetchUserAnalyses: (userId: string) => Promise<void>;
  addAnalysis: (data: Omit<AnalysisData, 'id' | 'createdAt'>) => Promise<AnalysisData>;
  removeAnalysis: (id: string) => Promise<void>;
  getAnalysisById: (id: string) => AnalysisData | undefined;
  clearError: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  analyses: [],
  loading: false,
  error: null,

  fetchAllAnalyses: async () => {
    set({ loading: true, error: null });
    try {
      const analyses = await getAllAnalyses();
      set({ analyses, loading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengambil data analisis';
      set({ error: msg, loading: false });
    }
  },

  fetchUserAnalyses: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const analyses = await getAnalysisByUser(userId);
      set({ analyses, loading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal mengambil data analisis';
      set({ error: msg, loading: false });
    }
  },

  addAnalysis: async (data) => {
    set({ loading: true, error: null });
    try {
      const newAnalysis = await saveAnalysis(data);
      set((state) => ({ analyses: [newAnalysis, ...state.analyses], loading: false }));
      return newAnalysis;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan analisis';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  removeAnalysis: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteAnalysisFromFirestore(id);
      set((state) => ({
        analyses: state.analyses.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal menghapus analisis';
      set({ error: msg, loading: false });
      throw error;
    }
  },

  getAnalysisById: (id: string) => {
    return get().analyses.find((a) => a.id === id);
  },

  clearError: () => set({ error: null }),
}));
