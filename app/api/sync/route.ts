import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { addToWatchlist } from '@/lib/db/watchlist';
import { addRecentlyWatched } from '@/lib/db/recently-watched';
import { addFavorite } from '@/lib/db/favorites';
import { addRecentSearch } from '@/lib/db/recent-searches';

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { watchlist, recentlyWatched, favorites, recentSearches } = body;

		const results = {
			watchlist: { added: 0, errors: 0 },
			recentlyWatched: { added: 0, errors: 0 },
			favorites: { added: 0, errors: 0 },
			recentSearches: { added: 0, errors: 0 },
		};

		// Sync watchlist
		if (watchlist && Array.isArray(watchlist)) {
			for (const item of watchlist) {
				try {
					// Normalize the item structure to match WatchlistItem interface
					const normalizedItem = {
						mediaId: item.mediaId || item.id,
						mediaType: item.mediaType || 'movie',
						posterPath: item.posterPath || item.poster_path || null,
						backdropPath: item.backdropPath || item.backdrop_path || null,
						title: item.title || item.name || '',
						overview: item.overview || null,
					};

					// Validate required fields
					if (!normalizedItem.mediaId || !normalizedItem.title) {
						console.warn('Skipping invalid watchlist item:', item);
						results.watchlist.errors++;
						continue;
					}

					await addToWatchlist(session.user.id, normalizedItem);
					results.watchlist.added++;
				} catch (error) {
					console.error('Error syncing watchlist item:', error);
					results.watchlist.errors++;
				}
			}
		}

		// Sync recently watched
		if (recentlyWatched && Array.isArray(recentlyWatched)) {
			for (const item of recentlyWatched) {
				try {
					await addRecentlyWatched(session.user.id, item);
					results.recentlyWatched.added++;
				} catch (error) {
					console.error('Error syncing recently watched:', error);
					results.recentlyWatched.errors++;
				}
			}
		}

		// Sync favorites
		if (favorites && Array.isArray(favorites)) {
			for (const item of favorites) {
				try {
					// Normalize the item structure
					const mediaId = item.mediaId || item.id;
					const mediaType = item.mediaType || 'movie';

					// Validate required fields
					if (!mediaId) {
						console.warn('Skipping invalid favorite item:', item);
						results.favorites.errors++;
						continue;
					}

					await addFavorite(session.user.id, mediaId, mediaType);
					results.favorites.added++;
				} catch (error) {
					console.error('Error syncing favorite:', error);
					results.favorites.errors++;
				}
			}
		}

		// Sync recent searches
		if (recentSearches && Array.isArray(recentSearches)) {
			for (const item of recentSearches) {
				try {
					await addRecentSearch(session.user.id, item.query || item);
					results.recentSearches.added++;
				} catch (error) {
					console.error('Error syncing recent search:', error);
					results.recentSearches.errors++;
				}
			}
		}

		return NextResponse.json({ success: true, results });
	} catch (error) {
		console.error('Error syncing data:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
