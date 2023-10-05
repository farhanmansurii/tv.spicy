import {
  deleteAllRecentlySearchedFromDB,
  loadRecentlySearchedFromDB,
  saveRecentlySearchedToDB,
} from "@/lib/indexedDB";
import create from "zustand";

const useRecentSearchStore = create((set) => ({
  recentlySearched: [], // Initialize an empty array to store recently searched items

  addToRecentSearches: async (searchObj) => {
    // Add the entire search object to the recently searched items array
    set((state) => ({ recentlySearched: [...state.recentlySearched, searchObj] }));
  },

  saveRecentlySearched: async () => {
    // Save the entire recently searched items array to IndexedDB
    try {
      await saveRecentlySearchedToDB(useRecentSearchStore.getState().recentlySearched);
    } catch (error) {
      console.error("Error saving recently searched items:", error);
    }
  },

  loadRecentlySearched: async () => {
    // Load recently searched items from IndexedDB and set them in the store
    try {
      const items = await loadRecentlySearchedFromDB();
      set({ recentlySearched: items });
    } catch (error) {
      console.error("Error loading recently searched items:", error);
    }
  },

  deleteAllRecentlySearched: async () => {
    // Delete all recently searched items from IndexedDB and reset the array
    try {
      await deleteAllRecentlySearchedFromDB();
      set({ recentlySearched: [] });
    } catch (error) {
      console.error("Error deleting recently searched items:", error);
    }
  },
}));

export default useRecentSearchStore;
