import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import {
	getWatchlist,
	addToWatchlist,
	removeFromWatchlist,
	clearWatchlist,
} from '@/lib/db/watchlist';

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const mediaType = searchParams.get('type') as 'movie' | 'tv' | null;

		const watchlist = await getWatchlist(session.user.id, mediaType || undefined);
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

		const body = await request.json();

		// Normalize the item structure to match WatchlistItem interface
		const normalizedItem = {
			mediaId: body.mediaId || body.id,
			mediaType: body.mediaType || 'movie',
			posterPath: body.posterPath || body.poster_path || null,
			backdropPath: body.backdropPath || body.backdrop_path || null,
			title: body.title || body.name || '',
			overview: body.overview || null,
		};

		// Validate required fields
		if (!normalizedItem.mediaId || !normalizedItem.title) {
			return NextResponse.json(
				{ error: 'Missing required fields: mediaId and title are required' },
				{ status: 400 }
			);
		}

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

		const searchParams = request.nextUrl.searchParams;
		const mediaId = searchParams.get('mediaId');
		const mediaType = searchParams.get('mediaType') as 'movie' | 'tv' | null;

		if (mediaId && mediaType) {
			const parsedMediaId = parseInt(mediaId, 10);
			if (isNaN(parsedMediaId)) {
				return NextResponse.json({ error: 'Invalid mediaId' }, { status: 400 });
			}
			await removeFromWatchlist(session.user.id, parsedMediaId, mediaType);
		} else {
			await clearWatchlist(session.user.id, mediaType || undefined);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from watchlist:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
