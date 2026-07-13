import { NextRequest, NextResponse } from 'next/server';
import { fetchGenreById } from '@/lib/api/tmdb-client';
import { cachedResponseHeaders, TMDB_CACHE_SECONDS } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const type = searchParams.get('type');
	const genreId = searchParams.get('genreId');
	const pageValue = searchParams.get('page') ?? '1';
	const page = Number(pageValue);

	if (
		(type !== 'movie' && type !== 'tv') ||
		!genreId ||
		!/^[1-9]\d*$/.test(genreId) ||
		!Number.isInteger(page) ||
		page < 1 ||
		page > 500
	) {
		return NextResponse.json(
			{ error: 'Invalid TMDB genre parameters' },
			{ status: 400, headers: cachedResponseHeaders() }
		);
	}

	const data = await fetchGenreById(type, genreId, page);
	return NextResponse.json(data, { headers: cachedResponseHeaders() });
}
