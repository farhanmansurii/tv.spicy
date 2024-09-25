import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Show, Anime } from '@/lib/types';

interface SearchState {
  recentlySearched: (Show | Anime)[];
  addToRecentlySearched: (show: Show | Anime) => void;
}

const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentlySearched: [],
      addToRecentlySearched: (show) =>
        set((state) => ({
          recentlySearched: [show, ...state.recentlySearched.filter((s) => s.id !== show.id)].slice(0, 10),
        })),
    }),
    {
      name: 'search-storage',
    }
  )
);

export default useSearchStore;
