import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import {
	getWatchlist,
	addToWatchlist,
	removeFromWatchlist,
	clearWatchlist,
} from '@/lib/db/watchlist';
import {
	listFilterQuerySchema,
	removeItemQuerySchema,
	watchlistAddBodySchema,
	firstValidationError,
} from '@/lib/validation/api-schemas';
import { badRequest, tooManyRequests } from '@/lib/api/route-responses';
import { rateLimitRetryAfter } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const parsed = listFilterQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams)
		);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		const watchlist = await getWatchlist(session.user.id, parsed.data.type);
		return NextResponse.json(watchlist);
	} catch (error) {
		console.error('Error fetching watchlist:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const retryAfter = rateLimitRetryAfter(`watchlist:post:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return badRequest('Invalid JSON body');
		}

		const parsed = watchlistAddBodySchema.safeParse(body);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		// The schema's refine guarantees an id and a title are present.
		const mediaId = parsed.data.mediaId ?? parsed.data.id;
		const title = parsed.data.title || parsed.data.name || '';
		if (!mediaId || !title) {
			return badRequest('Missing required fields: mediaId and title are required');
		}

		// Normalize the item structure to match WatchlistItem interface
		const normalizedItem = {
			mediaId,
			mediaType: parsed.data.mediaType ?? 'movie',
			posterPath: parsed.data.posterPath ?? parsed.data.poster_path ?? null,
			backdropPath: parsed.data.backdropPath ?? parsed.data.backdrop_path ?? null,
			title,
			overview: parsed.data.overview ?? null,
		};

		const item = await addToWatchlist(session.user.id, normalizedItem);
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error adding to watchlist:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const retryAfter = rateLimitRetryAfter(`watchlist:delete:${session.user.id}`);
		if (retryAfter !== null) {
			return tooManyRequests(retryAfter);
		}

		const parsed = removeItemQuerySchema.safeParse(
			Object.fromEntries(request.nextUrl.searchParams)
		);
		if (!parsed.success) {
			return badRequest(firstValidationError(parsed.error));
		}

		const { mediaId, mediaType } = parsed.data;

		if (mediaId && mediaType) {
			await removeFromWatchlist(session.user.id, mediaId, mediaType);
		} else {
			await clearWatchlist(session.user.id, mediaType);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from watchlist:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
