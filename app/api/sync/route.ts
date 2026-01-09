import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addToWatchlist } from '@/lib/db/watchlist';
import { addRecentlyWatched } from '@/lib/db/recently-watched';
import { addFavorite } from '@/lib/db/favorites';
import { addRecentSearch } from '@/lib/db/recent-searches';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
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
					await addToWatchlist(session.user.id, item);
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
					await addFavorite(session.user.id, item.mediaId, item.mediaType);
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
