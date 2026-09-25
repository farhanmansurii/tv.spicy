import { NextRequest, NextResponse } from 'next/server';
import { fetchGenresStrict } from '@/lib/api/tmdb-client';
import { tmdbGenresQuerySchema } from '@/lib/validation/api-schemas';
import { badRequest, upstreamErrorResponse } from '@/lib/api/route-responses';
import { cachedResponseHeaders, TMDB_CACHE_SECONDS } from '../cache';

export const revalidate = 604800;

export async function GET(request: NextRequest) {
	const parsed = tmdbGenresQuerySchema.safeParse(
		Object.fromEntries(request.nextUrl.searchParams)
	);
	if (!parsed.success) {
		return badRequest('Invalid TMDB media type');
	}

	try {
		const data = await fetchGenresStrict(parsed.data.type);
		return NextResponse.json(data, {
			headers: {
				...cachedResponseHeaders(),
				'Cache-Control': `public, s-maxage=${TMDB_CACHE_SECONDS * 7}, stale-while-revalidate=${TMDB_CACHE_SECONDS * 7}`,
			},
		});
	} catch (error) {
		// Upstream failure must never be cached as an empty genre list.
		return upstreamErrorResponse(error, 'tmdb/genres');
	}
}
