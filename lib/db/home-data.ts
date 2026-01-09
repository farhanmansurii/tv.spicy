import { getWatchlist } from './watchlist';
import { getRecentlyWatched } from './recently-watched';
import { getFavorites } from './favorites';

export interface UserHomeData {
	recentlyWatched: Awaited<ReturnType<typeof getRecentlyWatched>>;
	watchlistMovies: Awaited<ReturnType<typeof getWatchlist>>;
	watchlistTV: Awaited<ReturnType<typeof getWatchlist>>;
	favoriteMovies: Awaited<ReturnType<typeof getFavorites>>;
	favoriteTV: Awaited<ReturnType<typeof getFavorites>>;
}

/**
 * Batch fetch all user data for homepage
 * Optimized to fetch in parallel for better performance
 */
export async function fetchUserHomeData(userId: string): Promise<UserHomeData> {
	try {
		const [recentlyWatched, watchlistMovies, watchlistTV, favoriteMovies, favoriteTV] = await Promise.all([
			getRecentlyWatched(userId),
			getWatchlist(userId, 'movie'),
			getWatchlist(userId, 'tv'),
			getFavorites(userId, 'movie'),
			getFavorites(userId, 'tv'),
		]);

		return {
			recentlyWatched,
			watchlistMovies,
			watchlistTV,
			favoriteMovies,
			favoriteTV,
		};
	} catch (error) {
		console.error('Error fetching user home data:', error);
		// Return empty arrays on error for graceful degradation
		return {
			recentlyWatched: [],
			watchlistMovies: [],
			watchlistTV: [],
			favoriteMovies: [],
			favoriteTV: [],
		};
	}
}
