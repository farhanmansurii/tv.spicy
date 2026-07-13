export const TMDB_CACHE_SECONDS = 60 * 60 * 24;

export function cachedResponseHeaders() {
	return {
		'Cache-Control': `public, s-maxage=${TMDB_CACHE_SECONDS}, stale-while-revalidate=${TMDB_CACHE_SECONDS}`,
	};
}
