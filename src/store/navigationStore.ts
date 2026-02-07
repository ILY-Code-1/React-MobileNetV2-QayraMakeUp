import { create } from 'zustand';

interface NavigationState {
  currentTab: 'home' | 'activity' | 'users';
  setCurrentTab: (tab: 'home' | 'activity' | 'users') => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentTab: 'home',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));
