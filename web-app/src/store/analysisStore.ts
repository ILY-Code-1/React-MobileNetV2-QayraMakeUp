import { create } from 'zustand';

export interface AnalysisData {
  id: string;
  name: string;
  email: string;
  eventDate: string;
}

interface AnalysisStore {
  analyses: AnalysisData[];
  setAnalyses: (analyses: AnalysisData[]) => void;
  addAnalysis: (analysis: AnalysisData) => void;
  updateAnalysis: (id: string, analysis: Partial<AnalysisData>) => void;
  deleteAnalysis: (id: string) => void;
  getAnalysisById: (id: string) => AnalysisData | undefined;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  analyses: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      eventDate: '2024-02-15',
    },
    {
      id: '2',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      eventDate: '2024-02-14',
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      eventDate: '2024-02-13',
    },
    {
      id: '4',
      name: 'John Smith',
      email: 'john.smith@example.com',
      eventDate: '2024-02-12',
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      eventDate: '2024-02-11',
    },
  ],

  setAnalyses: (analyses) => set({ analyses }),

  addAnalysis: (analysis) =>
    set((state) => ({
      analyses: [...state.analyses, analysis],
    })),

  updateAnalysis: (id, updatedAnalysis) =>
    set((state) => ({
      analyses: state.analyses.map((a) =>
        a.id === id ? { ...a, ...updatedAnalysis } : a
      ),
    })),

  deleteAnalysis: (id) =>
    set((state) => ({
      analyses: state.analyses.filter((a) => a.id !== id),
    })),

  getAnalysisById: (id) => {
    return get().analyses.find((a) => a.id === id);
  },
}));
