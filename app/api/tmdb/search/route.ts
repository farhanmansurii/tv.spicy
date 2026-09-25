import { NextRequest, NextResponse } from 'next/server';
import { searchTMDBStrict } from '@/lib/api/tmdb-client';
import { tmdbSearchQuerySchema } from '@/lib/validation/api-schemas';
import { badRequest, upstreamErrorResponse } from '@/lib/api/route-responses';

export const revalidate = 3600;

export async function GET(request: NextRequest) {
	const parsed = tmdbSearchQuerySchema.safeParse(
		Object.fromEntries(request.nextUrl.searchParams)
	);
	if (!parsed.success) {
		return badRequest('Invalid search parameters');
	}

	try {
		const data = await searchTMDBStrict(parsed.data.query, parsed.data.page);
		return NextResponse.json(data, {
			headers: {
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
				'Vercel-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
			},
		});
	} catch (error) {
		// Upstream failure must never be cached as an empty result set.
		return upstreamErrorResponse(error, 'tmdb/search');
	}
}
