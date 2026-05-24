/**
 * Next.js 16 optimized detail page data fetching.
 * Uses React cache() for request deduping and unstable_cache for cross-request caching.
 * fetch() is uncached by default in Next.js 16 — we are explicit about what gets cached.
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
	fetchDetailsTMDB,
	fetchCredits,
	fetchVideos,
	fetchRowData,
} from './tmdb-client';
import type { MediaType } from './tmdb-client';

// Re-export types
export type { MediaType };

/* ────────────────────────────────────────────────────────────
   Per-request deduping (React cache)
   Same function call within one render is deduped automatically.
   ──────────────────────────────────────────────────────────── */

export const getShow = cache(fetchDetailsTMDB);
export const getCredits = cache(fetchCredits);
export const getVideos = cache(fetchVideos);
export const getRowData = cache(fetchRowData);

/* ────────────────────────────────────────────────────────────
   Cross-request caching (unstable_cache)
   Survives between requests. Use for data that changes infrequently.
   ──────────────────────────────────────────────────────────── */

export const getShowCached = (id: string, type: MediaType) =>
	unstable_cache(
		() => fetchDetailsTMDB(id, type),
		[`tmdb-show-${type}-${id}`],
		{ revalidate: 3600, tags: [`show-${type}-${id}`] }
	)();

export const getCreditsCached = (id: string, type: MediaType) =>
	unstable_cache(
		() => fetchCredits(id, type),
		[`tmdb-credits-${type}-${id}`],
		{ revalidate: 86400, tags: [`credits-${type}-${id}`] }
	)();

export const getSimilarCached = (id: string, type: MediaType) =>
	unstable_cache(
		() => fetchRowData(`${type}/${id}/similar`),
		[`tmdb-similar-${type}-${id}`],
		{ revalidate: 3600, tags: [`similar-${type}-${id}`] }
	)();

export const getRecommendationsCached = (id: string, type: MediaType) =>
	unstable_cache(
		() => fetchRowData(`${type}/${id}/recommendations`),
		[`tmdb-recommendations-${type}-${id}`],
		{ revalidate: 3600, tags: [`recommendations-${type}-${id}`] }
	)();

/* ────────────────────────────────────────────────────────────
   Parallel detail fetchers — return plain objects for easy use
   ──────────────────────────────────────────────────────────── */

export async function getDetailShow(id: string, type: MediaType) {
	return getShowCached(id, type);
}

export async function getDetailCredits(id: string, type: MediaType) {
	return getCreditsCached(id, type);
}

export async function getDetailRelated(id: string, type: MediaType) {
	const [similar, recommendations] = await Promise.all([
		getSimilarCached(id, type).catch(() => [] as Awaited<ReturnType<typeof fetchRowData>>),
		getRecommendationsCached(id, type).catch(() => [] as Awaited<ReturnType<typeof fetchRowData>>),
	]);
	return { similar, recommendations };
}
