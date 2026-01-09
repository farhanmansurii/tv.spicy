import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from '@/lib/db/favorites';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const mediaType = searchParams.get('type') as 'movie' | 'tv' | null;

		const favorites = await getFavorites(session.user.id, mediaType || undefined);
		return NextResponse.json(favorites);
	} catch (error) {
		console.error('Error fetching favorites:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { mediaId, mediaType } = body;
		const item = await addFavorite(session.user.id, mediaId, mediaType);
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error adding favorite:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const mediaId = searchParams.get('mediaId');
		const mediaType = searchParams.get('mediaType') as 'movie' | 'tv' | null;

		if (mediaId && mediaType) {
			await removeFavorite(session.user.id, parseInt(mediaId), mediaType);
		} else {
			await clearFavorites(session.user.id, mediaType || undefined);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing favorite:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
