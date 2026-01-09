import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesState {
	favoriteMovies: any[];
	favoriteTV: any[];
	addFavorite: (item: any, mediaType: 'movie' | 'tv') => Promise<void>;
	removeFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
	clearFavorites: (mediaType?: 'movie' | 'tv') => Promise<void>;
	loadFromDatabase: () => Promise<void>;
	syncWithDatabase: () => Promise<void>;
}

const syncFavoriteToDatabase = async (
	mediaId: number,
	mediaType: 'movie' | 'tv',
	action: 'add' | 'remove'
) => {
	try {
		if (action === 'add') {
			await fetch('/api/favorites', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mediaId, mediaType }),
			});
		} else {
			await fetch(`/api/favorites?mediaId=${mediaId}&mediaType=${mediaType}`, {
				method: 'DELETE',
			});
		}
	} catch (error) {
		console.error('Error syncing favorite to database:', error);
	}
};

export const useFavoritesStore = create<FavoritesState>()(
	persist(
		(set, get) => ({
			favoriteMovies: [],
			favoriteTV: [],
			addFavorite: async (item: any, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				set((state) => ({
					[key]: [item, ...(state[key as keyof FavoritesState] as any[]).filter((i: any) => i.id !== item.id)],
				}));
				await syncFavoriteToDatabase(item.id, mediaType, 'add');
			},
			removeFavorite: async (mediaId: number, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				set((state) => ({
					[key]: (state[key as keyof FavoritesState] as any[]).filter((i: any) => i.id !== mediaId),
				}));
				await syncFavoriteToDatabase(mediaId, mediaType, 'remove');
			},
			clearFavorites: async (mediaType?: 'movie' | 'tv') => {
				if (mediaType) {
					const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
					set({ [key]: [] });
					await fetch(`/api/favorites?mediaType=${mediaType}`, { method: 'DELETE' });
				} else {
					set({ favoriteMovies: [], favoriteTV: [] });
					await Promise.all([
						fetch('/api/favorites?mediaType=movie', { method: 'DELETE' }),
						fetch('/api/favorites?mediaType=tv', { method: 'DELETE' }),
					]);
				}
			},
			loadFromDatabase: async () => {
				try {
					const [moviesResponse, tvResponse] = await Promise.all([
						fetch('/api/favorites?type=movie'),
						fetch('/api/favorites?type=tv'),
					]);

					if (!moviesResponse.ok || !tvResponse.ok) {
						throw new Error('Failed to fetch favorites');
					}

					const movies = await moviesResponse.json();
					const tv = await tvResponse.json();

					// Convert database format to local format
					// Note: Favorites only store mediaId, so we'll need to fetch details separately
					// For now, store the IDs and let components fetch details as needed
					const convertToLocalFormat = (item: any) => ({
						id: item.mediaId,
						media_type: item.mediaType.toLowerCase(),
					});

					const localMovies = movies.map(convertToLocalFormat);
					const localTV = tv.map(convertToLocalFormat);

					set({ favoriteMovies: localMovies, favoriteTV: localTV });
				} catch (error) {
					console.error('Error loading favorites from database:', error);
				}
			},
			syncWithDatabase: async () => {
				const { favoriteMovies, favoriteTV } = get();
				for (const item of favoriteMovies) {
					await syncFavoriteToDatabase(item.id, 'movie', 'add');
				}
				for (const item of favoriteTV) {
					await syncFavoriteToDatabase(item.id, 'tv', 'add');
				}
			},
		}),
		{
			name: 'favorites-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
