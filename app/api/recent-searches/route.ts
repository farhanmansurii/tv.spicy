import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '@/lib/db/recent-searches';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const searchParams = request.nextUrl.searchParams;
		const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

		const searches = await getRecentSearches(session.user.id, limit);
		return NextResponse.json(searches);
	} catch (error) {
		console.error('Error fetching recent searches:', error);
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
		const { query } = body;
		const item = await addRecentSearch(session.user.id, query);
		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error adding recent search:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		await clearRecentSearches(session.user.id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error clearing recent searches:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
