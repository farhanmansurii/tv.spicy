import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { addToWatchlist } from '@/lib/db/watchlist';
import { mergeRecentlyWatchedBatch } from '@/lib/db/recently-watched';
import { addFavorite } from '@/lib/db/favorites';
import { addRecentSearch } from '@/lib/db/recent-searches';
import { fetchUserHomeData } from '@/lib/db/home-data';
import {
	syncBodySchema,
	SYNC_MAX_BODY_BYTES,
	firstValidationError,
} from '@/lib/validation/api-schemas';
import { badRequest, payloadTooLarge, tooManyRequests } from '@/lib/api/route-responses';
import { rateLimitRetryAfter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// ---- request validation (everything below this block is merge logic) ----
		const retryAfter = rateLimitRetryAfter(`sync:post:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		const declaredLength = Number(request.headers.get('content-length') ?? '0');
		if (Number.isFinite(declaredLength) && declaredLength > SYNC_MAX_BODY_BYTES) {
			return payloadTooLarge('Sync payload too large');
		}

		const rawBody = await request.text();
		if (Buffer.byteLength(rawBody, 'utf8') > SYNC_MAX_BODY_BYTES) {
			return payloadTooLarge('Sync payload too large');
		}

		let parsedBody: unknown;
		try {
			parsedBody = JSON.parse(rawBody);
		} catch {
			return badRequest('Invalid JSON body');
		}

		const validatedBody = syncBodySchema.safeParse(parsedBody);
		if (!validatedBody.success) {
			// Arrays past SYNC_MAX_ITEMS_PER_LIST are oversized payloads (413);
			// anything else malformed is a 400.
			const oversized = validatedBody.error.issues.some(
				(issue) => issue.code === 'too_big'
			);
			return oversized
				? payloadTooLarge('Sync payload too large')
				: badRequest(firstValidationError(validatedBody.error));
		}
		// -------------------------------------------------------------------------

		const { watchlist, recentlyWatched, favorites, recentSearches } = validatedBody.data;

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

		// Sync recently watched (empty payloads are skipped: they must never trigger
		// a merge that could touch rows the client didn't send)
		if (recentlyWatched && Array.isArray(recentlyWatched) && recentlyWatched.length > 0) {
			for (const item of recentlyWatched) {
				if (!item?.mediaId) {
					results.recentlyWatched.errors++;
				}
			}

			try {
				const mergedCount = await mergeRecentlyWatchedBatch(session.user.id, recentlyWatched);
				results.recentlyWatched.added = mergedCount;
			} catch (error) {
				console.error('Error syncing recently watched:', error);
				results.recentlyWatched.errors = recentlyWatched.length;
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

		const data = await fetchUserHomeData(session.user.id);
		return NextResponse.json({ success: true, results, data });
	} catch (error) {
		console.error('Error syncing data:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
