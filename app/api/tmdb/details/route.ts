import { NextRequest, NextResponse } from 'next/server';
import { fetchBasicDetailsTMDB } from '@/lib/api/tmdb-client';
import { tmdbDetailsQuerySchema } from '@/lib/validation/api-schemas';
import { badRequest, upstreamErrorResponse } from '@/lib/api/route-responses';
import { cachedResponseHeaders } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const parsed = tmdbDetailsQuerySchema.safeParse(
		Object.fromEntries(request.nextUrl.searchParams)
	);
	if (!parsed.success) {
		return badRequest('Invalid detail parameters');
	}

	try {
		const details = await fetchBasicDetailsTMDB(parsed.data.id, parsed.data.type);
		// null means TMDB definitively does not know this id (stable 404).
		return details
			? NextResponse.json(details, { headers: cachedResponseHeaders() })
			: NextResponse.json({ error: 'Media not found' }, { status: 404 });
	} catch (error) {
		// A TMDB outage is an upstream failure (502/503, no-store), not a 404.
		return upstreamErrorResponse(error, 'tmdb/details');
	}
}
