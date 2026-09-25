/**
 * Centralized TMDB API Client
 * Optimized for Next.js 16 with proper caching, error handling, and environment variables
 */

import type {
	TMDBCreditsResponse,
	TMDBEpisodeDetails,
	TMDBImagesResponse,
	TMDBListResponse,
	TMDBMovie,
	TMDBTVShow,
	TMDBSeasonDetails,
	TMDBVideosResponse,
	TMDBBaseMedia,
	Genre,
} from '@/lib/types/tmdb';

// ============================================================================
// Configuration & Constants
// ============================================================================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';
const TMDB_BEARER_TOKEN =
	process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN || process.env.TMDB_BEARER_TOKEN || '';

// Validate API credentials
if (!TMDB_BEARER_TOKEN && !TMDB_API_KEY) {
	console.warn(
		'⚠️  TMDB API credentials not found. Please set NEXT_PUBLIC_TMDB_BEARER_TOKEN or TMDB_API_KEY in your environment variables.'
	);
}

// Cache durations (in seconds)
const CACHE_DURATIONS = {
	SHORT: 60 * 60, // 1 hour
	MEDIUM: 60 * 60 * 24, // 1 day
	LONG: 60 * 60 * 24 * 7, // 7 days
	VERY_LONG: 60 * 60 * 24 * 14, // 14 days
} as const;

// Request timeout (in milliseconds)
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Retry configuration (idempotent requests only — see tmdbFetch)
const MAX_RETRIES = 2; // retries after the initial attempt
const RETRY_DELAY = 1000; // base backoff delay, doubles per attempt
const MAX_RETRY_DELAY = 10_000; // never wait longer than this, even for Retry-After

// ============================================================================
// Types
// ============================================================================

export type MediaType = 'movie' | 'tv';
export type TimeWindow = 'day' | 'week';

interface FetchOptions {
	revalidate?: number;
	headers?: Record<string, string>;
	timeout?: number;
	retries?: number;
	/**
	 * HTTP method. Only idempotent methods (GET/HEAD) are ever retried, so a
	 * future non-idempotent caller cannot silently opt into replay.
	 */
	method?: 'GET' | 'HEAD';
}

interface TMDBError {
	success: boolean;
	status_code: number;
	status_message: string;
}

/**
 * Exported so route handlers can distinguish an upstream TMDB failure
 * (answer with 502/503 + no-store) from a genuine empty/missing result.
 */
export class TMDBRequestError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
		this.name = 'TMDBRequestError';
	}
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Statuses worth retrying: upstream server errors and rate limiting.
 * (429 is retried with its Retry-After honoured — see tmdbFetch.)
 */
function isRetryableStatus(status: number): boolean {
	return status === 429 || (status >= 500 && status < 600);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
	if (!error) return false;
	const message = String(error.message ?? '').toLowerCase();

	if (error instanceof TMDBRequestError) {
		return isRetryableStatus(error.status);
	}

	// Retry on network errors, timeouts and 429/5xx server errors
	if (
		error.name === 'AbortError' ||
		error.name === 'TimeoutError' ||
		message.includes('timeout') ||
		message.includes('network')
	) {
		return true;
	}

	const statusCode = error.message?.match(/\((\d+)\)/)?.[1];
	if (statusCode) {
		return isRetryableStatus(parseInt(statusCode, 10));
	}

	return false;
}

/**
 * Real exponential backoff: RETRY_DELAY * 2^attempt, capped (1s, 2s, 4s, …).
 * `attempt` is zero-based.
 */
function backoffDelayMs(attempt: number): number {
	return Math.min(RETRY_DELAY * 2 ** attempt, MAX_RETRY_DELAY);
}

/**
 * Parse a `Retry-After` header (delta-seconds or HTTP-date) into milliseconds.
 * Returns null when absent or unparsable.
 */
function parseRetryAfterMs(value: string | null): number | null {
	if (!value) return null;
	const seconds = Number(value.trim());
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
	const dateMs = Date.parse(value);
	if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
	return null;
}

// ============================================================================
// Core Fetch Function
// ============================================================================

/**
 * Base fetch function with error handling, caching, retries, and timeout
 */
async function tmdbFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
	const {
		revalidate = CACHE_DURATIONS.MEDIUM,
		headers = {},
		timeout = REQUEST_TIMEOUT,
		retries = MAX_RETRIES,
		method = 'GET',
	} = options;

	// Retries are only safe for idempotent requests. A non-idempotent request
	// must never be replayed, so it is attempted exactly once.
	const normalizedMethod = method.toUpperCase();
	const idempotent = normalizedMethod === 'GET' || normalizedMethod === 'HEAD';
	const maxRetries = idempotent ? retries : 0;

	// Ensure endpoint starts with /
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	// Parse endpoint to handle existing query params
	const endpointUrl = new URL(cleanEndpoint, 'http://dummy.com');
	const pathWithQuery = endpointUrl.pathname + endpointUrl.search;

	const url = new URL(`${TMDB_BASE_URL}${pathWithQuery}`);

	// Prepare headers - prefer Bearer token, fallback to API key
	const defaultHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers,
	};

	// Use Bearer token if available, otherwise use API key
	if (TMDB_BEARER_TOKEN) {
		defaultHeaders['Authorization'] = `Bearer ${TMDB_BEARER_TOKEN}`;
	} else if (TMDB_API_KEY) {
		// If no Bearer token, add API key to query params (only if not already present)
		if (!url.searchParams.has('api_key')) {
			url.searchParams.set('api_key', TMDB_API_KEY);
		}
	} else {
		throw new Error('TMDB API credentials not configured');
	}

	let lastError: Error | null = null;

	// Retry logic
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			// Abort the upstream request itself when it times out. Promise.race
			// alone leaves the fetch consuming serverless CPU in the background.
			const response = await fetch(url.toString(), {
				method: normalizedMethod,
				headers: defaultHeaders,
				next: { revalidate },
				signal: AbortSignal.timeout(timeout),
			});

			if (!response.ok) {
				// Read the body exactly once: a failed response.json() consumes the
				// stream, and a second read() would throw a Body-is-unusable error
				// that hides the real upstream status.
				const rawBody = await response.text();
				let statusMessage = response.statusText;
				try {
					const parsed = JSON.parse(rawBody) as Partial<TMDBError> | null;
					if (parsed?.status_message) statusMessage = parsed.status_message;
				} catch {
					// Non-JSON error body (e.g. an HTML proxy page); keep statusText.
				}

				const error = new TMDBRequestError(
					`TMDB API Error (${response.status}): ${statusMessage}`,
					response.status
				);

				// Retry idempotent requests on 429 (honouring Retry-After) and 5xx.
				if (idempotent && attempt < maxRetries && isRetryableStatus(response.status)) {
					lastError = error;
					const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'));
					const waitMs = Math.min(
						Math.max(backoffDelayMs(attempt), retryAfterMs ?? 0),
						MAX_RETRY_DELAY
					);
					await delay(waitMs);
					continue;
				}

				// Don't retry on 4xx errors (except 429, handled above)
				throw error;
			}

			return await response.json();
		} catch (error: any) {
			lastError = error;

			// Don't retry on non-retryable errors
			if (!idempotent || !isRetryableError(error) || attempt >= maxRetries) {
				console.error(
					`Error fetching ${cleanEndpoint} (attempt ${attempt + 1}/${maxRetries + 1}):`,
					error
				);
				throw error;
			}

			// Exponential backoff between retries (429s carry Retry-After above)
			await delay(backoffDelayMs(attempt));
		}
	}

	// If we get here, all retries failed
	throw lastError || new Error(`Failed to fetch ${cleanEndpoint} after ${maxRetries + 1} attempts`);
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch list data (trending, popular, etc.)
 *
 * Lenient variant for server-rendered pages: an upstream failure degrades to
 * an empty row instead of erroring the page. API routes must use
 * `fetchRowDataStrict` so an outage is never cached as an empty result.
 */
export async function fetchRowData(endpoint: string): Promise<TMDBBaseMedia[]> {
	try {
		return await fetchRowDataStrict(endpoint);
	} catch (error) {
		console.error(`Error fetching row data for ${endpoint}:`, error);
		return [];
	}
}

/**
 * Strict variant of {@link fetchRowData}: rejects when TMDB cannot be reached
 * or answers with an error, and resolves to `[]` only when TMDB genuinely
 * returned no results — so callers can keep the two cases apart.
 */
export async function fetchRowDataStrict(endpoint: string): Promise<TMDBBaseMedia[]> {
	// Ensure endpoint starts with /
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	// Parse existing query params if any
	const url = new URL(cleanEndpoint, 'http://dummy.com');

	// Set default query parameters (will override if already present)
	url.searchParams.set('language', 'en-US');
	url.searchParams.set('include_adult', 'false');
	url.searchParams.set('include_video', 'false');

	// Get the path and query string (without the dummy domain)
	const fullEndpoint = url.pathname + url.search;

	const data = await tmdbFetch<TMDBListResponse<TMDBBaseMedia>>(fullEndpoint, {
		revalidate: CACHE_DURATIONS.LONG,
	});

	if (!data || !Array.isArray(data.results)) {
		throw new TMDBRequestError('TMDB returned a malformed list response', 502);
	}

	return data.results;
}

/**
 * Fetch media details with full information
 */
export async function fetchDetailsTMDB(
	id: string,
	type: MediaType
): Promise<
	(TMDBMovie & TMDBTVShow & { images?: TMDBImagesResponse; videos?: TMDBVideosResponse }) | null
> {
	const appendToResponse = [
		'images',
		'videos',
		'watch/providers',
		'keywords',
		'external_ids',
	].join(',');

	const endpoint = `/${type}/${id}?append_to_response=${appendToResponse}&include_image_language=en,null`;

	try {
		return await tmdbFetch<
			TMDBMovie & TMDBTVShow & { images?: TMDBImagesResponse; videos?: TMDBVideosResponse }
		>(endpoint, {
			revalidate: CACHE_DURATIONS.SHORT, // Details change more frequently
		});
	} catch (error) {
		// A missing TMDB record is a stable not-found result. Operational
		// failures must escape so ISR does not persist a transient outage as 404.
		if (error instanceof TMDBRequestError && error.status === 404) {
			return null;
		}
		console.error(`Error fetching details for ${type}/${id}:`, error);
		throw error;
	}
}

/**
 * Fetch only the fields needed to render a media card. Unlike fetchDetailsTMDB,
 * this deliberately avoids the large appended videos/providers/images payload.
 *
 * A missing TMDB record resolves to null (a stable not-found result); any
 * operational failure throws so callers can answer 502/503 instead of
 * misreporting an outage as a cacheable 404.
 */
export async function fetchBasicDetailsTMDB(
	id: string,
	type: MediaType
): Promise<(TMDBMovie & TMDBTVShow) | null> {
	try {
		return await tmdbFetch<TMDBMovie & TMDBTVShow>(`/${type}/${id}?language=en-US`, {
			revalidate: CACHE_DURATIONS.LONG,
		});
	} catch (error) {
		if (error instanceof TMDBRequestError && error.status === 404) {
			return null;
		}
		console.error(`Error fetching basic ${type} details for ${id}:`, error);
		throw error;
	}
}

/**
 * Fetch media images
 */
export async function fetchTMDBImages(
	id: string,
	type: MediaType
): Promise<TMDBImagesResponse | null> {
	const endpoint = `/${type}/${id}/images?include_image_language=en,null`;

	try {
		return await tmdbFetch<TMDBImagesResponse>(endpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error('Error fetching TMDB images:', error);
		return null;
	}
}

/**
 * Fetch recommendations or similar content
 */
export async function fetchRecommendations(
	id: string,
	type: MediaType,
	recommendationType: 'recommendations' | 'similar' = 'recommendations'
): Promise<TMDBListResponse<TMDBBaseMedia>> {
	const endpoint = `/${type}/${id}/${recommendationType}?language=en-US&page=1`;

	try {
		return await tmdbFetch<TMDBListResponse<TMDBBaseMedia>>(endpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error(`Error fetching ${recommendationType} for ${type}/${id}:`, error);
		return { results: [], page: 1, total_pages: 0, total_results: 0 };
	}
}

/**
 * Fetch credits (cast & crew)
 */
export async function fetchCredits(
	id: string,
	type: MediaType
): Promise<TMDBCreditsResponse | null> {
	const endpoint = `/${type}/${id}/credits?language=en-US`;

	try {
		return await tmdbFetch<TMDBCreditsResponse>(endpoint, {
			revalidate: CACHE_DURATIONS.LONG, // Credits rarely change
		});
	} catch (error) {
		console.error('Error fetching credits:', error);
		return null;
	}
}

/**
 * Fetch videos (trailers, teasers, etc.)
 */
export async function fetchVideos(id: string, type: MediaType): Promise<TMDBVideosResponse | null> {
	const endpoint = `/${type}/${id}/videos?language=en-US`;

	try {
		return await tmdbFetch<TMDBVideosResponse>(endpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error('Error fetching videos:', error);
		return null;
	}
}

/**
 * Fetch genres list
 *
 * Lenient variant for pages; API routes should use `fetchGenresStrict`.
 */
export async function fetchGenres(type: MediaType): Promise<Genre[]> {
	try {
		return await fetchGenresStrict(type);
	} catch (error) {
		console.error(`Error fetching ${type} genres:`, error);
		return [];
	}
}

/**
 * Strict variant of {@link fetchGenres}: rejects on upstream failure,
 * resolves to `[]` only when TMDB genuinely returned no genres.
 */
export async function fetchGenresStrict(type: MediaType): Promise<Genre[]> {
	const endpoint = `/genre/${type}/list?language=en`;

	const data = await tmdbFetch<{ genres: Genre[] }>(endpoint, {
		revalidate: CACHE_DURATIONS.VERY_LONG, // Genres rarely change
	});

	if (!data || !Array.isArray(data.genres)) {
		throw new TMDBRequestError('TMDB returned a malformed genre response', 502);
	}

	return data.genres;
}

/**
 * Fetch media by genre
 *
 * Lenient variant for pages; API routes should use `fetchGenreByIdStrict`.
 */
export async function fetchGenreById(
	type: MediaType,
	genreId: string,
	page: number = 1
): Promise<TMDBBaseMedia[]> {
	try {
		return await fetchGenreByIdStrict(type, genreId, page);
	} catch (error) {
		console.error(`Error fetching genre ${genreId} for ${type}:`, error);
		return [];
	}
}

/**
 * Strict variant of {@link fetchGenreById}: rejects on upstream failure,
 * resolves to `[]` only when TMDB genuinely returned no results.
 */
export async function fetchGenreByIdStrict(
	type: MediaType,
	genreId: string,
	page: number = 1
): Promise<TMDBBaseMedia[]> {
	const params = new URLSearchParams({
		include_adult: 'false',
		include_video: 'false',
		language: 'en-US',
		page: page.toString(),
		sort_by: 'popularity.desc',
		with_genres: genreId,
	});

	const endpoint = `/discover/${type}?${params.toString()}`;

	const data = await tmdbFetch<TMDBListResponse<TMDBBaseMedia>>(endpoint, {
		revalidate: CACHE_DURATIONS.MEDIUM,
	});

	if (!data || !Array.isArray(data.results)) {
		throw new TMDBRequestError('TMDB returned a malformed discover response', 502);
	}

	return data.results;
}

/**
 * Search media
 *
 * Lenient variant for pages; API routes should use `searchTMDBStrict`.
 */
export async function searchTMDB(
	query: string,
	page: number = 1
): Promise<TMDBListResponse<TMDBBaseMedia>> {
	try {
		return await searchTMDBStrict(query, page);
	} catch (error) {
		console.error('Error searching TMDB:', error);
		return { results: [], page: 1, total_pages: 0, total_results: 0 };
	}
}

/**
 * Strict variant of {@link searchTMDB}: rejects on upstream failure and only
 * resolves to an empty result set when TMDB genuinely matched nothing.
 */
export async function searchTMDBStrict(
	query: string,
	page: number = 1
): Promise<TMDBListResponse<TMDBBaseMedia>> {
	const params = new URLSearchParams({
		query: encodeURIComponent(query),
		page: page.toString(),
		include_adult: 'false',
		language: 'en-US',
	});

	const endpoint = `/search/multi?${params.toString()}`;

	const data = await tmdbFetch<TMDBListResponse<TMDBBaseMedia>>(endpoint, {
		revalidate: CACHE_DURATIONS.SHORT, // Search results change frequently
	});

	if (!data || !Array.isArray(data.results)) {
		throw new TMDBRequestError('TMDB returned a malformed search response', 502);
	}

	// Filter to only movies and TV shows
	return {
		...data,
		results: data.results.filter(
			(item) => item.media_type === 'movie' || item.media_type === 'tv'
		),
	};
}

/**
 * Discover media with filters
 */
export interface DiscoverOptions {
	type?: MediaType;
	genres?: number[];
	year?: string;
	minRating?: number;
	language?: string;
	sortBy?: string;
	page?: number;
}

export async function discoverMedia(
	options: DiscoverOptions = {}
): Promise<TMDBListResponse<TMDBBaseMedia>> {
	const {
		type = 'movie',
		genres = [],
		year,
		minRating = 0,
		language,
		sortBy = 'popularity.desc',
		page = 1,
	} = options;

	const params = new URLSearchParams({
		language: 'en-US',
		sort_by: sortBy,
		page: page.toString(),
		include_adult: 'false',
	});

	if (genres.length > 0) {
		params.append('with_genres', genres.join(','));
	}

	if (year) {
		if (type === 'movie') {
			params.append('primary_release_year', year);
		} else {
			params.append('first_air_date_year', year);
		}
	}

	if (minRating > 0) {
		params.append('vote_average.gte', minRating.toString());
		params.append('vote_count.gte', '50'); // Ensure minimum votes for quality
	}

	if (language) {
		params.append('with_original_language', language);
	}

	const endpoint = `/discover/${type}?${params.toString()}`;

	try {
		return await tmdbFetch<TMDBListResponse<TMDBBaseMedia>>(endpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error('Error discovering media:', error);
		return { results: [], page: 1, total_pages: 0, total_results: 0 };
	}
}

/**
 * Fetch season episodes
 */
export async function fetchSeasonEpisodes(
	showId: string,
	seasonNumber: number
): Promise<TMDBSeasonDetails> {
	const endpoint = `/tv/${showId}/season/${seasonNumber}`;

	try {
		// Build URL with query params
		const url = new URL(endpoint, 'http://dummy.com');
		url.searchParams.set('language', 'en-US');
		const fullEndpoint = url.pathname + url.search;

		return await tmdbFetch<TMDBSeasonDetails>(fullEndpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error('Error fetching season episodes:', error);
		throw error;
	}
}

/**
 * Fetch episode details
 */
export async function fetchEpisodeDetails(
	showId: string,
	seasonNumber: number,
	episodeNumber: number
): Promise<TMDBEpisodeDetails | null> {
	const endpoint = `/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`;

	try {
		// Build URL with query params
		const url = new URL(endpoint, 'http://dummy.com');
		url.searchParams.set('language', 'en-US');
		url.searchParams.set('append_to_response', 'credits,images');
		const fullEndpoint = url.pathname + url.search;

		return await tmdbFetch<TMDBEpisodeDetails>(fullEndpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error('Error fetching episode details:', error);
		return null;
	}
}

/**
 * Fetch hero items with full details (optimized batch fetch)
 */
export async function fetchHeroItemsWithDetails(
	shows: TMDBBaseMedia[],
	type: MediaType,
	maxItems: number = 4
): Promise<TMDBBaseMedia[]> {
	try {
		const topShows = shows.slice(0, maxItems);

		// Fetch details in parallel with error handling
		const detailsPromises = topShows.map((show) =>
			fetchDetailsTMDB(
				show.id.toString(),
				(show.media_type === 'movie' || show.media_type === 'tv'
					? show.media_type
					: type) as MediaType
			).catch(() => show)
		);

		const detailsResults = await Promise.allSettled(detailsPromises);

		const enhancedShows = detailsResults.map((result, index) => {
			if (result.status === 'fulfilled' && result.value) {
				const fullShow = { ...topShows[index], ...result.value } as TMDBBaseMedia & {
					images?: TMDBImagesResponse;
					videos?: unknown;
					keywords?: unknown;
					external_ids?: unknown;
					'watch/providers'?: unknown;
				};
				const {
					videos: _videos,
					keywords: _keywords,
					external_ids: _externalIds,
					'watch/providers': _watchProviders,
					images,
					...compactShow
				} = fullShow;

				return {
					...compactShow,
					images: images
						? {
								backdrops: images.backdrops.slice(0, 3),
								posters: images.posters.slice(0, 3),
								logos: images.logos.slice(0, 2),
							}
						: undefined,
				} as TMDBBaseMedia;
			}
			return topShows[index];
		});

		return [...enhancedShows, ...shows.slice(maxItems)];
	} catch (error) {
		console.error('Error fetching hero item details:', error);
		return shows;
	}
}

/**
 * Get new and popular shows (optimized parallel fetch)
 */
export async function getNewAndPopularShows() {
	try {
		const [topRatedTV, topRatedMovie, trendingMovie, trendingTv] = await Promise.all([
			fetchRowData('tv/top_rated'),
			fetchRowData('movie/top_rated'),
			fetchRowData('trending/movie/week'),
			fetchRowData('trending/tv/week'),
		]);

		return {
			topRatedTV,
			topRatedMovie,
			trendingTv,
			trendingMovie,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		throw new Error('Failed to fetch shows: ' + message);
	}
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Get API key for client-side use (if needed)
 * Note: Only use this if absolutely necessary for client-side code
 */
export const getClientAPIKey = () => {
	if (typeof window !== 'undefined') {
		return process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
	}
	return '';
};
