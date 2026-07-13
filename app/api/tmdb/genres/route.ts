import { NextRequest, NextResponse } from 'next/server';
import { fetchGenres } from '@/lib/api/tmdb-client';
import { cachedResponseHeaders, TMDB_CACHE_SECONDS } from '../cache';

export const revalidate = 604800;

export async function GET(request: NextRequest) {
	const type = request.nextUrl.searchParams.get('type');

	if (type !== 'movie' && type !== 'tv') {
		return NextResponse.json(
			{ error: 'Invalid TMDB media type' },
			{ status: 400, headers: cachedResponseHeaders() }
		);
	}

	const data = await fetchGenres(type);
	return NextResponse.json(data, {
		headers: {
			...cachedResponseHeaders(),
			'Cache-Control': `public, s-maxage=${TMDB_CACHE_SECONDS * 7}, stale-while-revalidate=${TMDB_CACHE_SECONDS * 7}`,
		},
	});
}
