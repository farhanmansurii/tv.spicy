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
 * Upper bound of live TMDB detail lookups per home-page render. Favorites past
 * the cap fall back to the watchlist snapshot (cached/stale user data) when one
 * exists and are otherwise dropped for this render instead of firing more
 * upstream requests. This fanout was the main driver of TMDB 429s.
 */
const MAX_FAVORITE_FETCHES = 20;
/** How many TMDB requests may be in flight at once while filling the batch. */
const FAVORITE_FETCH_CONCURRENCY = 4;

/**
 * Map `items` through `task` with at most `limit` tasks in flight at a time.
 * Result order matches input order.
 */
async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	task: (item: T) => Promise<R>
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
		for (let index = cursor++; index < items.length; index = cursor++) {
			results[index] = await task(items[index]);
		}
	});
	await Promise.all(workers);
	return results;
}

/**
 * Batch fetch all user data for homepage
 *
 * Favorites resolve from the watchlist snapshot for free; only the remainder
 * are looked up on TMDB, capped at MAX_FAVORITE_FETCHES and bounded to
 * FAVORITE_FETCH_CONCURRENCY in-flight requests.
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

		type FavoriteCard = TMDBBaseMedia & { media_type: 'movie' | 'tv' };

		// Watchlist-backed favorites are served from local (stale) data with no
		// TMDB request at all.
		const favorites: Array<FavoriteCard | null> = favoriteRows.map((favorite) => {
			const mediaType = favorite.mediaType.toLowerCase() as 'movie' | 'tv';
			const saved = watchlistByMedia.get(`${favorite.mediaType}:${favorite.mediaId}`);
			if (!saved) return null;
			return {
				id: favorite.mediaId,
				title: saved.title,
				name: saved.title,
				poster_path: saved.posterPath,
				backdrop_path: saved.backdropPath,
				overview: saved.overview,
				media_type: mediaType,
			} as FavoriteCard;
		});

		// Only uncached favorites are eligible for live lookups, capped per render.
		const candidates = favoriteRows
			.map((favorite, index) => ({ favorite, index }))
			.filter(({ index }) => favorites[index] === null)
			.slice(0, MAX_FAVORITE_FETCHES);

		const resolved = await mapWithConcurrency(
			candidates,
			FAVORITE_FETCH_CONCURRENCY,
			async ({ favorite }) => {
				const mediaType = favorite.mediaType.toLowerCase() as 'movie' | 'tv';
				try {
					const details = await fetchBasicDetailsTMDB(String(favorite.mediaId), mediaType);
					return details ? ({ ...details, media_type: mediaType } as FavoriteCard) : null;
				} catch {
					// A failed TMDB lookup drops one card, never the whole page.
					return null;
				}
			}
		);
		candidates.forEach(({ index }, position) => {
			favorites[index] = resolved[position];
		});

		return {
			recentlyWatched,
			watchlist,
			favorites: favorites.filter(
				(item): item is FavoriteCard => item !== null
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
