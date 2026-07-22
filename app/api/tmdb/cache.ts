export const TMDB_CACHE_SECONDS = 60 * 60 * 24;
const TMDB_STALE_SECONDS = 60 * 60 * 24 * 7;

export function cachedResponseHeaders() {
	return {
		'Cache-Control': `public, s-maxage=${TMDB_CACHE_SECONDS}, stale-while-revalidate=${TMDB_STALE_SECONDS}`,
		'Vercel-CDN-Cache-Control': `public, s-maxage=${TMDB_CACHE_SECONDS}, stale-while-revalidate=${TMDB_STALE_SECONDS}`,
	};
}
