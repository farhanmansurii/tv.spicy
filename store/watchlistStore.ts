import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { useAuthStore } from '@/store/authStore';
import { invalidateUserQueries } from '@/lib/query-client';

interface Show {
	id: number;
	title?: string;
	name?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	overview?: string | null;
	media_type?: string;
}

interface WatchlistState {
	watchlist: Show[];
	tvwatchlist: Show[];
	isInitialized: boolean;
	isLoading: boolean;
}

interface WatchlistActions {
	addToWatchlist: (show: Show) => void;
	removeFromWatchList: (id: number) => void;
	clearWatchlist: () => void;
	addToTvWatchlist: (show: Show) => void;
	removeFromTvWatchList: (id: number) => void;
	clearTVWatchlist: () => void;
	loadFromDatabase: () => Promise<void>;
	syncWithDatabase: () => Promise<void>;
	initialize: () => Promise<void>;
	resetInitialization: () => void;
}

type WatchlistStore = WatchlistState & WatchlistActions;

type MyPersist = (
	config: StateCreator<WatchlistStore>,
	options: PersistOptions<WatchlistStore>
) => StateCreator<WatchlistStore>;

// Background sync - fire and forget
const syncToDatabase = (mediaType: 'movie' | 'tv', item: Show, action: 'add' | 'remove') => {
	setTimeout(async () => {
		try {
			const authState = useAuthStore.getState();
			if (!authState.isAuthenticated || !authState.userId) {
				return;
			}

			if (action === 'add') {
				const normalizedItem = {
					mediaId: item.id,
					mediaType,
					posterPath: item.poster_path || null,
					backdropPath: item.backdrop_path || null,
					title: item.title || item.name || '',
					overview: item.overview || null,
				};

				const response = await fetch('/api/watchlist', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(normalizedItem),
					credentials: 'include',
				});

				if (!response.ok) {
					throw new Error(`Failed to sync: ${response.statusText}`);
				}
			} else {
				const response = await fetch(
					`/api/watchlist?mediaId=${item.id}&mediaType=${mediaType}`,
					{
						method: 'DELETE',
						credentials: 'include',
					}
				);

				if (!response.ok) {
					throw new Error(`Failed to remove: ${response.statusText}`);
				}
			}
		} catch (error) {
			console.error('Background sync error:', error);
		}
	}, 0);
};

const convertToLocalFormat = (item: any): Show => ({
	id: item.mediaId,
	title: item.title,
	name: item.title,
	poster_path: item.posterPath,
	backdrop_path: item.backdropPath,
	overview: item.overview,
	media_type: item.mediaType?.toLowerCase(),
});

const useWatchListStore = create<WatchlistStore>()(
	(persist as MyPersist)(
		(set, get) => ({
			watchlist: [],
			tvwatchlist: [],
			isInitialized: false,
			isLoading: false,

			addToWatchlist: (show: Show) => {
				const authState = useAuthStore.getState();
				set((state) => ({
					watchlist: [show, ...state.watchlist.filter((s) => s.id !== show.id)],
				}));
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				syncToDatabase('movie', show, 'add');
			},

			removeFromWatchList: (id: number) => {
				const currentState = get();
				const authState = useAuthStore.getState();
				const show = currentState.watchlist.find((s) => s.id === id);
				set((state) => ({
					watchlist: state.watchlist.filter((s) => s.id !== id),
				}));
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				if (show) {
					syncToDatabase('movie', show, 'remove');
				}
			},

			clearWatchlist: () => {
				set({ watchlist: [] });
				const authState = useAuthStore.getState();
				if (authState.isAuthenticated) {
					fetch('/api/watchlist?mediaType=movie', {
						method: 'DELETE',
						credentials: 'include',
					}).catch(console.error);
				}
			},

			addToTvWatchlist: (show: Show) => {
				const authState = useAuthStore.getState();
				set((state) => ({
					tvwatchlist: [show, ...state.tvwatchlist.filter((s) => s.id !== show.id)],
				}));
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				syncToDatabase('tv', show, 'add');
			},

			removeFromTvWatchList: (id: number) => {
				const currentState = get();
				const authState = useAuthStore.getState();
				const show = currentState.tvwatchlist.find((s) => s.id === id);
				set((state) => ({
					tvwatchlist: state.tvwatchlist.filter((s) => s.id !== id),
				}));
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				if (show) {
					syncToDatabase('tv', show, 'remove');
				}
			},

			clearTVWatchlist: () => {
				set({ tvwatchlist: [] });
				const authState = useAuthStore.getState();
				if (authState.isAuthenticated) {
					fetch('/api/watchlist?mediaType=tv', {
						method: 'DELETE',
						credentials: 'include',
					}).catch(console.error);
				}
			},

			loadFromDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({ isInitialized: true });
					return;
				}

				try {
					const [moviesResponse, tvResponse] = await Promise.all([
						fetch('/api/watchlist?type=movie', { credentials: 'include' }),
						fetch('/api/watchlist?type=tv', { credentials: 'include' }),
					]);

					if (moviesResponse.status === 401 || tvResponse.status === 401) {
						set({ isInitialized: true });
						return;
					}

					const movies = moviesResponse.ok ? await moviesResponse.json() : [];
					const tv = tvResponse.ok ? await tvResponse.json() : [];

					const dbMovies = movies.map(convertToLocalFormat);
					const dbTV = tv.map(convertToLocalFormat);

					set((state) => {
						// Merge: keep local items, add DB items that are not already local
						const localMovieIds = new Set(state.watchlist.map((s) => s.id));
						const localTVIds = new Set(state.tvwatchlist.map((s) => s.id));

						return {
							watchlist: [
								...state.watchlist,
								...dbMovies.filter((item) => !localMovieIds.has(item.id)),
							],
							tvwatchlist: [
								...state.tvwatchlist,
								...dbTV.filter((item) => !localTVIds.has(item.id)),
							],
							isInitialized: true,
							isLoading: false,
						};
					});
				} catch (error) {
					console.error('Error loading watchlist from database:', error);
					set({ isLoading: false, isInitialized: true });
				}
			},

			syncWithDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) return;

				const { watchlist, tvwatchlist } = get();
				watchlist.forEach((item) => syncToDatabase('movie', item, 'add'));
				tvwatchlist.forEach((item) => syncToDatabase('tv', item, 'add'));
			},

			initialize: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({ isInitialized: true });
					return;
				}
				await get().loadFromDatabase();
			},

			resetInitialization: () => {
				set({ isInitialized: false });
			},
		}),
		{
			name: 'watchlist-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				watchlist: state.watchlist,
				tvwatchlist: state.tvwatchlist,
			}),
		}
	)
);

export default useWatchListStore;
