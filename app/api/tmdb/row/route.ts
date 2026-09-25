import { NextRequest, NextResponse } from 'next/server';
import { fetchRowDataStrict } from '@/lib/api/tmdb-client';
import { tmdbRowQuerySchema } from '@/lib/validation/api-schemas';
import { badRequest, upstreamErrorResponse } from '@/lib/api/route-responses';
import { cachedResponseHeaders } from '../cache';

export const revalidate = 86400;

export async function GET(request: NextRequest) {
	const parsed = tmdbRowQuerySchema.safeParse(
		Object.fromEntries(request.nextUrl.searchParams)
	);
	if (!parsed.success) {
		return badRequest('Invalid TMDB row endpoint');
	}

	try {
		const data = await fetchRowDataStrict(parsed.data.endpoint);
		return NextResponse.json(data, { headers: cachedResponseHeaders() });
	} catch (error) {
		// Upstream failure: 502/503 + no-store so the CDN keeps serving the
		// last good copy instead of caching an empty row for seven days.
		return upstreamErrorResponse(error, 'tmdb/row');
	}
}
