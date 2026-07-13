import { NextRequest, NextResponse } from 'next/server';
import { fetchSeasonEpisodes } from '@/lib/api/tmdb-client';
import { cachedResponseHeaders } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const showId = request.nextUrl.searchParams.get('showId') ?? '';
	const season = Number(request.nextUrl.searchParams.get('season'));

	if (!/^[1-9]\d*$/.test(showId) || !Number.isInteger(season) || season < 0) {
		return NextResponse.json({ error: 'Invalid season parameters' }, { status: 400 });
	}

	try {
		return NextResponse.json(await fetchSeasonEpisodes(showId, season), {
			headers: cachedResponseHeaders(),
		});
	} catch {
		return NextResponse.json({ error: 'Unable to load season' }, { status: 502 });
	}
}
