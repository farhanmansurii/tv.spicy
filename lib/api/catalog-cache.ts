/**
 * Catalog data for Cache Components (home + movie/tv catalog pages).
 * Public TMDB rows, genre lists, and hero enrichment are cached with
 * 'use cache' + cacheLife + cacheTag. Strict fetchers throw on upstream
 * failure, so an outage is never cached; sections render the client-fetch
 * fallback (DataRow without initialData) at request time instead.
 */

import { cacheLife, cacheTag } from 'next/cache';
import {
	fetchRowDataStrict,
	fetchGenresStrict,
	fetchGenreByIdStrict,
	fetchHeroItemsWithDetails,
} from './tmdb-client';
import type { MediaType } from './tmdb-client';
import type { TMDBBaseMedia } from '@/lib/types/tmdb';

export async function getCachedRow(endpoint: string) {
	'use cache';
	cacheLife('hours');
	cacheTag('catalog-row', `catalog-row-${endpoint}`);
	return fetchRowDataStrict(endpoint);
}

export async function getCachedGenres(type: MediaType) {
	'use cache';
	cacheLife('weeks');
	cacheTag('catalog-genres', `catalog-genres-${type}`);
	return fetchGenresStrict(type);
}

export async function getCachedGenreRow(type: MediaType, genreId: string) {
	'use cache';
	cacheLife('days');
	cacheTag('catalog-genre-row', `catalog-genre-row-${type}-${genreId}`);
	return fetchGenreByIdStrict(type, genreId, 1);
}

export async function getCachedHeroItems(
	shows: TMDBBaseMedia[],
	type: MediaType,
	maxItems: number
) {
	'use cache';
	cacheLife('hours');
	cacheTag('catalog-hero');
	return fetchHeroItemsWithDetails(shows, type, maxItems);
}
