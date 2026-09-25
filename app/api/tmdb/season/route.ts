import { NextRequest, NextResponse } from 'next/server';
import { fetchSeasonEpisodes } from '@/lib/api/tmdb-client';
import { tmdbSeasonQuerySchema } from '@/lib/validation/api-schemas';
import { badRequest, upstreamErrorResponse } from '@/lib/api/route-responses';
import { cachedResponseHeaders } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const parsed = tmdbSeasonQuerySchema.safeParse(
		Object.fromEntries(request.nextUrl.searchParams)
	);
	if (!parsed.success) {
		return badRequest('Invalid season parameters');
	}

	try {
		return NextResponse.json(await fetchSeasonEpisodes(parsed.data.showId, parsed.data.season), {
			headers: cachedResponseHeaders(),
		});
	} catch (error) {
		// Never cache a season load failure as data.
		return upstreamErrorResponse(error, 'tmdb/season');
	}
}
