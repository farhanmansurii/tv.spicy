import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { getWatchlist, addToWatchlist, removeFromWatchlist, clearWatchlist } from '@/lib/db/watchlist';

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
		const item = await addToWatchlist(session.user.id, body);
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
			await removeFromWatchlist(session.user.id, parseInt(mediaId), mediaType);
		} else {
			// Clear all
			await clearWatchlist(session.user.id, mediaType || undefined);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from watchlist:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
