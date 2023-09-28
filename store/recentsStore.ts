import {
  addRecentlySearched,
  addRecentlyWatched,
  getRecentlySearched,
  getRecentlyWatched,
} from "@/lib/indexedDB";
import { create } from "zustand";

interface TVShowStore {
  recentlyWatched: any[];
  recentlySearched: any[];
  addToRecentlyWatched: (tvShow: any) => void;
  addToRecentlySearched: (tvShow: any) => void;
  loadRecentlyWatched: () => void;
  loadRecentlySearched: () => void;
}

const useTVShowStore = create<TVShowStore>((set) => ({
  recentlyWatched: [],
  recentlySearched: [],
  addToRecentlyWatched: async (tvShow) => {
    await addRecentlyWatched(tvShow);
    set((state) => ({ recentlyWatched: [tvShow, ...state.recentlyWatched] }));
  },
  addToRecentlySearched: async (tvShow) => {
    await addRecentlySearched(tvShow);
    set((state) => {
      const recentlySearched = [tvShow, ...state.recentlySearched].slice(0, 5);
      return { recentlySearched };
    });
  },
  loadRecentlyWatched: async () => {
    const recentlyWatched = await getRecentlyWatched();
    set({ recentlyWatched });
  },
  loadRecentlySearched: async () => {
    const recentlySearched = await getRecentlySearched();
    set({ recentlySearched });
  },
}));

export default useTVShowStore;
