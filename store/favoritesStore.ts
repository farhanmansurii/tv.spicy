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
}

interface FavoritesState {
	favoriteMovies: FavoriteItem[];
	favoriteTV: FavoriteItem[];
	isInitialized: boolean;
	isLoading: boolean;
}

interface FavoritesActions {
	addFavorite: (item: FavoriteItem, mediaType: 'movie' | 'tv') => void;
	removeFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => void;
	clearFavorites: (mediaType?: 'movie' | 'tv') => void;
	loadFromDatabase: () => Promise<void>;
	syncWithDatabase: () => Promise<void>;
	initialize: () => Promise<void>;
	resetInitialization: () => void;
}

type FavoritesStore = FavoritesState & FavoritesActions;

// Background sync - fire and forget
const syncFavoriteToDatabase = (
	mediaId: number,
	mediaType: 'movie' | 'tv',
	action: 'add' | 'remove'
) => {
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
				const response = await fetch(
					`/api/favorites?mediaId=${mediaId}&mediaType=${mediaType}`,
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

const convertToLocalFormat = (item: any): FavoriteItem => ({
	id: item.mediaId,
	media_type: item.mediaType?.toLowerCase(),
});

export const useFavoritesStore = create<FavoritesStore>()(
	persist(
		(set, get) => ({
			favoriteMovies: [],
			favoriteTV: [],
			isInitialized: false,
			isLoading: false,

			addFavorite: (item: FavoriteItem, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				const authState = useAuthStore.getState();
				set((state) => ({
					[key]: [
						item,
						...(state[key as keyof FavoritesState] as FavoriteItem[]).filter(
							(i) => i.id !== item.id
						),
					],
				}));
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				syncFavoriteToDatabase(item.id, mediaType, 'add');
			},

			removeFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				const authState = useAuthStore.getState();
				set((state) => ({
					[key]: (state[key as keyof FavoritesStore] as FavoriteItem[]).filter(
						(i) => i.id !== mediaId
					),
				}));
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}
				syncFavoriteToDatabase(mediaId, mediaType, 'remove');
			},

			clearFavorites: (mediaType?: 'movie' | 'tv') => {
				const authState = useAuthStore.getState();
				if (mediaType) {
					const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
					set({ [key]: [] });
					if (authState.isAuthenticated) {
						fetch(`/api/favorites?mediaType=${mediaType}`, {
							method: 'DELETE',
							credentials: 'include',
						}).catch(console.error);
					}
				} else {
					set({ favoriteMovies: [], favoriteTV: [] });
					if (authState.isAuthenticated) {
						Promise.all([
							fetch('/api/favorites?mediaType=movie', {
								method: 'DELETE',
								credentials: 'include',
							}),
							fetch('/api/favorites?mediaType=tv', {
								method: 'DELETE',
								credentials: 'include',
							}),
						]).catch(console.error);
					}
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
						fetch('/api/favorites?type=movie', { credentials: 'include' }),
						fetch('/api/favorites?type=tv', { credentials: 'include' }),
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
						const localMovieIds = new Set(state.favoriteMovies.map((i) => i.id));
						const localTVIds = new Set(state.favoriteTV.map((i) => i.id));

						return {
							favoriteMovies: [
								...state.favoriteMovies,
								...dbMovies.filter((item) => !localMovieIds.has(item.id)),
							],
							favoriteTV: [
								...state.favoriteTV,
								...dbTV.filter((item) => !localTVIds.has(item.id)),
							],
							isInitialized: true,
							isLoading: false,
						};
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
				favoriteMovies.forEach((item) => syncFavoriteToDatabase(item.id, 'movie', 'add'));
				favoriteTV.forEach((item) => syncFavoriteToDatabase(item.id, 'tv', 'add'));
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
			name: 'favorites-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				favoriteMovies: state.favoriteMovies,
				favoriteTV: state.favoriteTV,
			}),
		}
	)
);
