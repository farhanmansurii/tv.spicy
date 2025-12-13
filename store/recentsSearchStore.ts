import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Show, Anime } from '@/lib/types';

interface SearchState {
	recentlySearched: (Show | Anime)[];
	addToRecentlySearched: (show: Show | Anime) => void;
	removeFromRecentlySearched: (id: number | string) => void;
	clearRecentlySearched: () => void;
}

const useSearchStore = create<SearchState>()(
	persist(
		(set) => ({
			recentlySearched: [],
			addToRecentlySearched: (show) =>
				set((state) => ({
					recentlySearched: [
						show,
						...state.recentlySearched.filter((s) => s.id !== show.id),
					].slice(0, 10),
				})),
			removeFromRecentlySearched: (id) =>
				set((state) => ({
					recentlySearched: state.recentlySearched.filter((s) => s.id !== id),
				})),
			clearRecentlySearched: () => set({ recentlySearched: [] }),
		}),
		{
			name: 'search-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
);

export default useSearchStore;
