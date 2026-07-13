import { NextRequest, NextResponse } from 'next/server';
import { fetchRowData } from '@/lib/api/tmdb-client';
import { cachedResponseHeaders, TMDB_CACHE_SECONDS } from '../cache';

export const revalidate = 86400;

const rowEndpointPattern =
	/^(?:trending\/(?:all|movie|tv)\/(?:day|week)|(?:movie|tv)\/(?:airing_today|on_the_air|popular|top_rated|upcoming|now_playing))$/;

function isValidRowEndpoint(endpoint: string) {
	return rowEndpointPattern.test(endpoint);
}

export async function GET(request: NextRequest) {
	const endpoint = request.nextUrl.searchParams.get('endpoint')?.trim() ?? '';

	if (!isValidRowEndpoint(endpoint)) {
		return NextResponse.json(
			{ error: 'Invalid TMDB row endpoint' },
			{ status: 400, headers: cachedResponseHeaders() }
		);
	}

	const data = await fetchRowData(endpoint);
	return NextResponse.json(data, { headers: cachedResponseHeaders() });
}
