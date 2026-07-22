import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB } from '@/lib/api/tmdb-client';

export const revalidate = 3600;

export async function GET(request: NextRequest) {
	const query = request.nextUrl.searchParams.get('query')?.trim() ?? '';
	const page = Number(request.nextUrl.searchParams.get('page') ?? '1');

	if (
		query.length < 2 ||
		query.length > 100 ||
		!Number.isInteger(page) ||
		page < 1 ||
		page > 500
	) {
		return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
	}

	return NextResponse.json(await searchTMDB(query, page), {
		headers: {
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
			'Vercel-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
		},
	});
}
