import { StateCreator, create } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";
import { useAuthStore } from "@/store/authStore";
import { invalidateUserQueries } from "@/lib/query-client";

interface Show {
	id: number;
	title?: string;
	name?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	overview?: string | null;
	media_type?: string;
	[key: string]: any;
}

interface WatchlistState {
	watchlist: Show[];
	tvwatchlist: Show[];
	isInitialized?: boolean;
	isLoading?: boolean;
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
}

type WatchlistStore = WatchlistState & WatchlistActions;

type MyPersist = (
	config: StateCreator<WatchlistStore>,
	options: PersistOptions<WatchlistStore>
) => StateCreator<WatchlistStore>;

// Background sync - fire and forget
const syncToDatabase = (mediaType: 'movie' | 'tv', item: Show, action: 'add' | 'remove') => {
	// Run in background, don't block
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
				const response = await fetch(`/api/watchlist?mediaId=${item.id}&mediaType=${mediaType}`, {
					method: 'DELETE',
					credentials: 'include',
				});

				if (!response.ok) {
					throw new Error(`Failed to remove: ${response.statusText}`);
				}
			}
		} catch (error) {
			console.error('Background sync error:', error);
		}
	}, 0);
};

const useWatchListStore = create<WatchlistStore>()(
	(persist as MyPersist)(
		(set, get) => ({
			watchlist: [],
			tvwatchlist: [],
			isInitialized: false as boolean,
			isLoading: false as boolean,

			addToWatchlist: (show: Show) => {
				const authState = useAuthStore.getState();
				// Optimistic update - instant UI feedback
				set((state) => ({
					watchlist: [show, ...state.watchlist.filter((s) => s.id !== show.id)],
				}));
				// Invalidate React Query cache
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				// Sync in background
				syncToDatabase('movie', show, 'add');
			},

			removeFromWatchList: (id: number) => {
				const currentState = get();
				const authState = useAuthStore.getState();
				const show = currentState.watchlist.find((s) => s.id === id);
				// Optimistic update - instant UI feedback
				set((state) => ({
					watchlist: state.watchlist.filter((s) => s.id !== id),
				}));
				// Invalidate React Query cache
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				// Sync in background
				if (show) {
					syncToDatabase('movie', show, 'remove');
				}
			},

			clearWatchlist: () => {
				// Optimistic update
				set({ watchlist: [] });
				// Sync in background
				const authState = useAuthStore.getState();
				if (authState.isAuthenticated) {
					fetch('/api/watchlist?mediaType=movie', { method: 'DELETE', credentials: 'include' }).catch(console.error);
				}
			},

			addToTvWatchlist: (show: Show) => {
				const authState = useAuthStore.getState();
				// Optimistic update - instant UI feedback
				set((state) => ({
					tvwatchlist: [show, ...state.tvwatchlist.filter((s) => s.id !== show.id)],
				}));
				// Invalidate React Query cache
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				// Sync in background
				syncToDatabase('tv', show, 'add');
			},

			removeFromTvWatchList: (id: number) => {
				const currentState = get();
				const authState = useAuthStore.getState();
				const show = currentState.tvwatchlist.find((s) => s.id === id);
				// Optimistic update - instant UI feedback
				set((state) => ({
					tvwatchlist: state.tvwatchlist.filter((s) => s.id !== id),
				}));
				// Invalidate React Query cache
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				// Sync in background
				if (show) {
					syncToDatabase('tv', show, 'remove');
				}
			},

			clearTVWatchlist: () => {
				// Optimistic update
				set({ tvwatchlist: [] });
				// Sync in background
				const authState = useAuthStore.getState();
				if (authState.isAuthenticated) {
					fetch('/api/watchlist?mediaType=tv', { method: 'DELETE', credentials: 'include' }).catch(console.error);
				}
			},

			loadFromDatabase: async () => {
				const state = get();
				if (state.isInitialized) return;

				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({ isInitialized: true });
					return;
				}

				set({ isLoading: true });
				try {
					const [moviesResponse, tvResponse] = await Promise.all([
						fetch('/api/watchlist?type=movie', { credentials: 'include' }),
						fetch('/api/watchlist?type=tv', { credentials: 'include' }),
					]);

					// Handle authentication errors gracefully
					if (moviesResponse.status === 401 || tvResponse.status === 401) {
						set({ isLoading: false, isInitialized: true });
						return;
					}

					// Check for other errors and provide specific error messages
					if (!moviesResponse.ok) {
						const errorData = await moviesResponse.json().catch(() => ({}));
						throw new Error(
							`Failed to fetch movies watchlist: ${moviesResponse.status} ${moviesResponse.statusText}${errorData.error ? ` - ${errorData.error}` : ''}`
						);
					}

					if (!tvResponse.ok) {
						const errorData = await tvResponse.json().catch(() => ({}));
						throw new Error(
							`Failed to fetch TV watchlist: ${tvResponse.status} ${tvResponse.statusText}${errorData.error ? ` - ${errorData.error}` : ''}`
						);
					}

					const movies = await moviesResponse.json();
					const tv = await tvResponse.json();

					const convertToLocalFormat = (item: any): Show => ({
						id: item.mediaId,
						title: item.title,
						name: item.title,
						poster_path: item.posterPath,
						backdrop_path: item.backdropPath,
						overview: item.overview,
						media_type: item.mediaType.toLowerCase(),
					});

					set({
						watchlist: movies.map(convertToLocalFormat),
						tvwatchlist: tv.map(convertToLocalFormat),
						isInitialized: true,
						isLoading: false,
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
				// Sync all items in background
				watchlist.forEach((item) => syncToDatabase('movie', item, 'add'));
				tvwatchlist.forEach((item) => syncToDatabase('tv', item, 'add'));
			},

			initialize: async () => {
				const { isInitialized, loadFromDatabase } = get();
				if (!isInitialized) {
					await loadFromDatabase();
				}
			},
		}),
		{
			name: "watchlist-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
);

export default useWatchListStore;
