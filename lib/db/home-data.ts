import { getWatchlist } from './watchlist';
import { getRecentlyWatched } from './recently-watched';
import { getFavorites } from './favorites';
import { fetchBasicDetailsTMDB } from '@/lib/api/tmdb-client';
import type { TMDBBaseMedia } from '@/lib/types/tmdb';

export interface UserHomeData {
	recentlyWatched: Awaited<ReturnType<typeof getRecentlyWatched>>;
	watchlist: Awaited<ReturnType<typeof getWatchlist>>;
	favorites: Array<TMDBBaseMedia & { media_type: 'movie' | 'tv' }>;
}

/**
 * Batch fetch all user data for homepage
 * Optimized to fetch in parallel for better performance
 */
export async function fetchUserHomeData(userId: string): Promise<UserHomeData> {
	try {
		const [recentlyWatched, watchlist, favoriteRows] = await Promise.all([
			getRecentlyWatched(userId),
			getWatchlist(userId),
			getFavorites(userId),
		]);

		const watchlistByMedia = new Map(
			watchlist.map((item) => [`${item.mediaType}:${item.mediaId}`, item])
		);
		const favorites = await Promise.all(
			favoriteRows.map(async (favorite) => {
				const mediaType = favorite.mediaType.toLowerCase() as 'movie' | 'tv';
				const saved = watchlistByMedia.get(`${favorite.mediaType}:${favorite.mediaId}`);
				if (saved) {
					return {
						id: favorite.mediaId,
						title: saved.title,
						name: saved.title,
						poster_path: saved.posterPath,
						backdrop_path: saved.backdropPath,
						overview: saved.overview,
						media_type: mediaType,
					} as TMDBBaseMedia & { media_type: 'movie' | 'tv' };
				}

				const details = await fetchBasicDetailsTMDB(String(favorite.mediaId), mediaType);
				return details ? { ...details, media_type: mediaType } : null;
			})
		);

		return {
			recentlyWatched,
			watchlist,
			favorites: favorites.filter(
				(item): item is TMDBBaseMedia & { media_type: 'movie' | 'tv' } => item !== null
			),
		};
	} catch (error) {
		console.error('Error fetching user home data:', error);
		// Return empty arrays on error for graceful degradation
		return {
			recentlyWatched: [],
			watchlist: [],
			favorites: [],
		};
	}
}
