import { create } from "zustand";

interface Episode {
  activeEP: any;
  setActiveEP: (activeEP: any) => void;
}

export const useEpisodeStore = create<Episode>()((set) => ({
  activeEP: [],
  setActiveEP: (activeEP: any[]) => set(() => ({ activeEP })),
}));
