/**
 * Detail page data for Cache Components.
 * Public TMDB catalog data is cached with 'use cache' + cacheLife + cacheTag;
 * React cache() only dedupes within a single request. The durable fetch-data
 * cache inside tmdb-client.ts is intentionally kept as a second layer.
 */

import { cacheLife, cacheTag } from 'next/cache';
import {
	fetchDetailsTMDB,
	fetchCredits,
	fetchRowData,
} from './tmdb-client';
import type { MediaType } from './tmdb-client';

// Re-export types
export type { MediaType };

/* ────────────────────────────────────────────────────────────
   Cached TMDB reads — one entry per id, shared across requests
   A missing record resolves to null (a stable, cacheable not-found);
   any operational failure throws, so an outage is never cached.
   ──────────────────────────────────────────────────────────── */

export async function getDetailShow(id: string, type: MediaType) {
	'use cache';
	cacheLife('days');
	cacheTag(`show-${type}-${id}`);
	return fetchDetailsTMDB(id, type);
}

export async function getDetailCredits(id: string, type: MediaType) {
	'use cache';
	cacheLife('days');
	cacheTag(`credits-${type}-${id}`);
	return fetchCredits(id, type);
}

export async function getDetailRelated(id: string, type: MediaType) {
	'use cache';
	cacheLife('days');
	cacheTag(`similar-${type}-${id}`, `recommendations-${type}-${id}`);
	const [similar, recommendations] = await Promise.all([
		fetchRowData(`${type}/${id}/similar`),
		fetchRowData(`${type}/${id}/recommendations`),
	]);
	return { similar, recommendations };
}
