/**
 * Shared API response helpers.
 *
 * Every failure response built with these helpers is explicitly `no-store` so
 * the CDN never replaces a previously cached good copy with an error body
 * (audit finding F1/F2).
 */
import { NextResponse } from 'next/server';
import { TMDBRequestError } from '@/lib/api/tmdb-client';

/** Headers that keep both the browser and the Vercel CDN from caching a response. */
export const NO_STORE_HEADERS = {
	'Cache-Control': 'no-store',
	'Vercel-CDN-Cache-Control': 'no-store',
} as const;

/** 400 — invalid input; never cacheable. */
export function badRequest(message: string) {
	return NextResponse.json({ error: message }, { status: 400, headers: NO_STORE_HEADERS });
}

/** 413 — payload exceeds the accepted size; never cacheable. */
export function payloadTooLarge(message = 'Payload too large') {
	return NextResponse.json({ error: message }, { status: 413, headers: NO_STORE_HEADERS });
}

/** 429 — per-user rate limit exceeded; never cacheable. */
export function tooManyRequests(retryAfterSeconds: number) {
	return NextResponse.json(
		{ error: 'Too many requests' },
		{
			status: 429,
			headers: {
				...NO_STORE_HEADERS,
				'Retry-After': String(retryAfterSeconds),
			},
		}
	);
}

/**
 * Map an upstream (TMDB) failure to a non-cacheable response:
 * - TMDB answered with an error status -> 502 Bad Gateway
 * - network failure / timeout / malformed payload -> 503 Service Unavailable
 *
 * Distinct from a genuine "not found", which callers answer with 404.
 */
export function upstreamErrorResponse(error: unknown, context: string) {
	const status = error instanceof TMDBRequestError ? 502 : 503;
	console.error(`Upstream failure (${context}):`, error);
	return NextResponse.json(
		{ error: status === 502 ? 'Upstream provider returned an error' : 'Service temporarily unavailable' },
		{ status, headers: NO_STORE_HEADERS }
	);
}
