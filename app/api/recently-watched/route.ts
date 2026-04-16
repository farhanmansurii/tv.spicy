import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import {
	getRecentlyWatched,
	saveRecentlyWatched,
	updateWatchProgress,
	deleteRecentlyWatched,
} from '@/lib/db/recently-watched';

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const limitParam = searchParams.get('limit');
		const limit = limitParam ? parseInt(limitParam, 10) : undefined;
		if (limitParam && isNaN(limit!)) {
			return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
		}

		const items = await getRecentlyWatched(session.user.id, limit);
		return NextResponse.json(items);
	} catch (error) {
		console.error('Error fetching recently watched:', error);
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
		const item = await saveRecentlyWatched(session.user.id, body);
		if (!item) {
			return NextResponse.json({ error: 'Invalid recently watched payload' }, { status: 400 });
		}
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error adding recently watched:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const session = await getServerSession();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { mediaId, progressPercent, mediaType, seasonNumber, episodeNumber } = body;

		if (!mediaId) {
			return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
		}

		const item = await updateWatchProgress(
			session.user.id,
			Number(mediaId),
			Number(progressPercent ?? 0),
			mediaType === 'movie' ? 'movie' : 'tv',
			seasonNumber,
			episodeNumber
		);
		return NextResponse.json({ success: true, item });
	} catch (error) {
		console.error('Error updating watch progress:', error);
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
		const mediaType = searchParams.get('mediaType');

		await deleteRecentlyWatched(session.user.id, {
			mediaId: mediaId ? Number(mediaId) : undefined,
			mediaType: mediaType === 'movie' ? 'movie' : mediaType === 'tv' ? 'tv' : undefined,
		});
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting recently watched:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
