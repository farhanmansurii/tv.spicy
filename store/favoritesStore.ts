import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from '@/store/authStore';
import { invalidateUserQueries } from '@/lib/query-client';

interface FavoriteItem {
	id: number;
	title?: string;
	name?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	overview?: string | null;
	media_type?: string;
	[key: string]: any;
}

interface FavoritesState {
	favoriteMovies: FavoriteItem[];
	favoriteTV: FavoriteItem[];
	isInitialized?: boolean;
	isLoading?: boolean;
}

interface FavoritesActions {
	addFavorite: (item: FavoriteItem, mediaType: 'movie' | 'tv') => void;
	removeFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => void;
	clearFavorites: (mediaType?: 'movie' | 'tv') => void;
	loadFromDatabase: () => Promise<void>;
	syncWithDatabase: () => Promise<void>;
	initialize: () => Promise<void>;
}

type FavoritesStore = FavoritesState & FavoritesActions;

// Background sync - fire and forget
const syncFavoriteToDatabase = (mediaId: number, mediaType: 'movie' | 'tv', action: 'add' | 'remove') => {
	// Run in background, don't block
	setTimeout(async () => {
		try {
			const authState = useAuthStore.getState();
			if (!authState.isAuthenticated || !authState.userId) {
				return;
			}

			if (action === 'add') {
				const response = await fetch('/api/favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ mediaId, mediaType }),
					credentials: 'include',
				});

				if (!response.ok) {
					throw new Error(`Failed to sync: ${response.statusText}`);
				}
			} else {
				const response = await fetch(`/api/favorites?mediaId=${mediaId}&mediaType=${mediaType}`, {
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

export const useFavoritesStore = create<FavoritesStore>()(
	persist(
		(set, get) => ({
			favoriteMovies: [],
			favoriteTV: [],
			isInitialized: false as boolean,
			isLoading: false as boolean,

			addFavorite: (item: FavoriteItem, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				const authState = useAuthStore.getState();
				// Optimistic update - instant UI feedback
				set((state) => ({
					[key]: [item, ...(state[key as keyof FavoritesState] as FavoriteItem[]).filter((i) => i.id !== item.id)],
				}));
				// Invalidate React Query cache
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				// Sync in background
				syncFavoriteToDatabase(item.id, mediaType, 'add');
			},

			removeFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				const authState = useAuthStore.getState();
				// Optimistic update - instant UI feedback
				set((state) => ({
					[key]: (state[key as keyof FavoritesStore] as FavoriteItem[]).filter((i) => i.id !== mediaId),
				}));
				// Invalidate React Query cache
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				// Sync in background
				syncFavoriteToDatabase(mediaId, mediaType, 'remove');
			},

			clearFavorites: (mediaType?: 'movie' | 'tv') => {
				const authState = useAuthStore.getState();
				// Optimistic update
				if (mediaType) {
					const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
					set({ [key]: [] });
					// Sync in background
					if (authState.isAuthenticated) {
						fetch(`/api/favorites?mediaType=${mediaType}`, { method: 'DELETE', credentials: 'include' }).catch(console.error);
					}
				} else {
					set({ favoriteMovies: [], favoriteTV: [] });
					// Sync in background
					if (authState.isAuthenticated) {
						Promise.all([
							fetch('/api/favorites?mediaType=movie', { method: 'DELETE', credentials: 'include' }),
							fetch('/api/favorites?mediaType=tv', { method: 'DELETE', credentials: 'include' }),
						]).catch(console.error);
					}
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
						fetch('/api/favorites?type=movie', { credentials: 'include' }),
						fetch('/api/favorites?type=tv', { credentials: 'include' }),
					]);

					if (!moviesResponse.ok || !tvResponse.ok) {
						throw new Error('Failed to fetch favorites');
					}

					const movies = await moviesResponse.json();
					const tv = await tvResponse.json();

					const convertToLocalFormat = (item: any): FavoriteItem => ({
						id: item.mediaId,
						media_type: item.mediaType.toLowerCase(),
					});

					set({
						favoriteMovies: movies.map(convertToLocalFormat),
						favoriteTV: tv.map(convertToLocalFormat),
						isInitialized: true,
						isLoading: false,
					});
				} catch (error) {
					console.error('Error loading favorites from database:', error);
					set({ isLoading: false, isInitialized: true });
				}
			},

			syncWithDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) return;

				const { favoriteMovies, favoriteTV } = get();
				// Sync all items in background
				favoriteMovies.forEach((item) => syncFavoriteToDatabase(item.id, 'movie', 'add'));
				favoriteTV.forEach((item) => syncFavoriteToDatabase(item.id, 'tv', 'add'));
			},

			initialize: async () => {
				const { isInitialized, loadFromDatabase } = get();
				if (!isInitialized) {
					await loadFromDatabase();
				}
			},
		}),
		{
			name: 'favorites-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
