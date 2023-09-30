// useTVShowStore.ts

import { create } from "zustand";
import { saveEpisodesToDB, loadEpisodesFromDB, deleteAllEpisodesFromDB } from "../lib/indexedDB"; // Import the IndexedDB utility functions

interface TVShowStore {
  recentlyWatched: any;
  addRecentlyWatched: (episode: any) => void;
  loadEpisodes: () => Promise<void>;
  deleteRecentlyWatched: () => any; // Return type should match TVShowStore
}

const useTVShowStore = create<TVShowStore>((set) => ({
  recentlyWatched: [],
  addRecentlyWatched: (episode) => {
    set((state) => {
      const existingIndex = state.recentlyWatched.findIndex(
        (existingEpisode: any) => existingEpisode.tv_id === episode.tv_id
      );
      const updatedRecentlyWatched = existingIndex !== -1
        ? [episode, ...state.recentlyWatched.filter((e:any) => e.tv_id !== episode.tv_id)]
        : [episode, ...state.recentlyWatched];
      saveEpisodesToDB(updatedRecentlyWatched);
      return { recentlyWatched: updatedRecentlyWatched };
    });
  },
  loadEpisodes: async () => {
    try {
      const episodes = await loadEpisodesFromDB();
      set({ recentlyWatched: episodes });
    } catch (error) {
      console.error("Error loading episodes from IndexedDB:", error);
    }
  },
  deleteRecentlyWatched: () => {
    set({ recentlyWatched: [] });
    deleteAllEpisodesFromDB(); // Save an empty array to IndexedDB
  },
}));

export default useTVShowStore;
