import { NextRequest, NextResponse } from 'next/server';
import { fetchGenreByIdStrict } from '@/lib/api/tmdb-client';
import { tmdbGenreQuerySchema } from '@/lib/validation/api-schemas';
import { badRequest, upstreamErrorResponse } from '@/lib/api/route-responses';
import { cachedResponseHeaders } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const parsed = tmdbGenreQuerySchema.safeParse(
		Object.fromEntries(request.nextUrl.searchParams)
	);
	if (!parsed.success) {
		return badRequest('Invalid TMDB genre parameters');
	}

	try {
		const data = await fetchGenreByIdStrict(parsed.data.type, parsed.data.genreId, parsed.data.page);
		return NextResponse.json(data, { headers: cachedResponseHeaders() });
	} catch (error) {
		// Upstream failure must never be cached as an empty genre page.
		return upstreamErrorResponse(error, 'tmdb/genre');
	}
}
