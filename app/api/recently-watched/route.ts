import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import {
	getRecentlyWatched,
	addRecentlyWatched,
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

		const episodes = await getRecentlyWatched(session.user.id, limit);
		return NextResponse.json(episodes);
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
		const item = await addRecentlyWatched(session.user.id, body);
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
		const { mediaId, progress, seasonNumber, episodeNumber } = body;

		await updateWatchProgress(session.user.id, mediaId, progress, seasonNumber, episodeNumber);
		return NextResponse.json({ success: true });
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

		await deleteRecentlyWatched(session.user.id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting recently watched:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
