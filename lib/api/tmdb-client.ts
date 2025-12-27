/**
 * Centralized TMDB API Client
 * Optimized for Next.js 16 with proper caching, error handling, and environment variables
 */

// ============================================================================
// Configuration & Constants
// ============================================================================

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Environment variables with fallbacks (for development only)
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';
const TMDB_BEARER_TOKEN = process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN || process.env.TMDB_BEARER_TOKEN || '';

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

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

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
}

interface TMDBResponse<T> {
	results: T[];
	page: number;
	total_pages: number;
	total_results: number;
}

interface TMDBError {
	success: boolean;
	status_code: number;
	status_message: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeout(ms: number): Promise<never> {
	return new Promise((_, reject) => {
		setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
	});
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
	if (!error) return false;

	// Retry on network errors or 5xx server errors
	if (error.message?.includes('timeout') || error.message?.includes('network')) {
		return true;
	}

	const statusCode = error.message?.match(/\((\d+)\)/)?.[1];
	if (statusCode) {
		const code = parseInt(statusCode, 10);
		return code >= 500 && code < 600;
	}

	return false;
}

// ============================================================================
// Core Fetch Function
// ============================================================================

/**
 * Base fetch function with error handling, caching, retries, and timeout
 */
async function tmdbFetch<T>(
	endpoint: string,
	options: FetchOptions = {}
): Promise<T> {
	const {
		revalidate = CACHE_DURATIONS.MEDIUM,
		headers = {},
		timeout = REQUEST_TIMEOUT,
		retries = MAX_RETRIES,
	} = options;

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
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			// Create fetch with timeout
			const fetchPromise = fetch(url.toString(), {
				headers: defaultHeaders,
				next: { revalidate },
			});

			const response = await Promise.race([
				fetchPromise,
				createTimeout(timeout),
			]) as Response;

			if (!response.ok) {
				let errorData: TMDBError | string;
				try {
					errorData = await response.json();
				} catch {
					errorData = await response.text();
				}

				const errorMessage =
					typeof errorData === 'string'
						? errorData
						: `TMDB API Error (${response.status}): ${errorData.status_message || response.statusText}`;

				const error = new Error(errorMessage);

				// Don't retry on 4xx errors (client errors)
				if (response.status >= 400 && response.status < 500) {
					throw error;
				}

				// Retry on 5xx errors
				if (isRetryableError(error) && attempt < retries) {
					lastError = error;
					await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
					continue;
				}

				throw error;
			}

			return await response.json();
		} catch (error: any) {
			lastError = error;

			// Don't retry on non-retryable errors
			if (!isRetryableError(error) || attempt >= retries) {
				console.error(`Error fetching ${cleanEndpoint} (attempt ${attempt + 1}/${retries + 1}):`, error);
				throw error;
			}

			// Wait before retrying
			await delay(RETRY_DELAY * (attempt + 1));
		}
	}

	// If we get here, all retries failed
	throw lastError || new Error(`Failed to fetch ${cleanEndpoint} after ${retries + 1} attempts`);
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch list data (trending, popular, etc.)
 */
export async function fetchRowData(endpoint: string): Promise<any[]> {
	try {
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

		const data = await tmdbFetch<TMDBResponse<any>>(fullEndpoint, {
			revalidate: CACHE_DURATIONS.LONG,
		});

		return data.results || [];
	} catch (error) {
		console.error(`Error fetching row data for ${endpoint}:`, error);
		return [];
	}
}

/**
 * Fetch media details with full information
 */
export async function fetchDetailsTMDB(
	id: string,
	type: MediaType
): Promise<any> {
	const appendToResponse = [
		'images',
		'videos',
		'watch/providers',
		'keywords',
		'external_ids',
	].join(',');

	const endpoint = `/${type}/${id}?append_to_response=${appendToResponse}&include_image_language=en,null`;

	try {
		return await tmdbFetch<any>(endpoint, {
			revalidate: CACHE_DURATIONS.SHORT, // Details change more frequently
		});
	} catch (error) {
		console.error(`Error fetching details for ${type}/${id}:`, error);
		return null;
	}
}

/**
 * Fetch media images
 */
export async function fetchTMDBImages(id: string, type: MediaType) {
	const endpoint = `/${type}/${id}/images?include_image_language=en,null`;

	try {
		return await tmdbFetch<any>(endpoint, {
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
) {
	const endpoint = `/${type}/${id}/${recommendationType}?language=en-US&page=1`;

	try {
		return await tmdbFetch<TMDBResponse<any>>(endpoint, {
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
export async function fetchCredits(id: string, type: MediaType) {
	const endpoint = `/${type}/${id}/credits?language=en-US`;

	try {
		return await tmdbFetch<any>(endpoint, {
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
export async function fetchVideos(id: string, type: MediaType) {
	const endpoint = `/${type}/${id}/videos?language=en-US`;

	try {
		return await tmdbFetch<any>(endpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
	} catch (error) {
		console.error('Error fetching videos:', error);
		return null;
	}
}

/**
 * Fetch genres list
 */
export async function fetchGenres(type: MediaType) {
	const endpoint = `/genre/${type}/list?language=en`;

	try {
		const data = await tmdbFetch<{ genres: any[] }>(endpoint, {
			revalidate: CACHE_DURATIONS.VERY_LONG, // Genres rarely change
		});
		return data.genres || [];
	} catch (error) {
		console.error(`Error fetching ${type} genres:`, error);
		return [];
	}
}

/**
 * Fetch media by genre
 */
export async function fetchGenreById(
	type: MediaType,
	genreId: string,
	page: number = 1
): Promise<any[]> {
	const params = new URLSearchParams({
		include_adult: 'false',
		include_video: 'false',
		language: 'en-US',
		page: page.toString(),
		sort_by: 'popularity.desc',
		with_genres: genreId,
	});

	const endpoint = `/discover/${type}?${params.toString()}`;

	try {
		const data = await tmdbFetch<TMDBResponse<any>>(endpoint, {
			revalidate: CACHE_DURATIONS.MEDIUM,
		});
		return data.results || [];
	} catch (error) {
		console.error(`Error fetching genre ${genreId} for ${type}:`, error);
		return [];
	}
}

/**
 * Search media
 */
export async function searchTMDB(query: string, page: number = 1) {
	const params = new URLSearchParams({
		query: encodeURIComponent(query),
		page: page.toString(),
		include_adult: 'false',
		language: 'en-US',
	});

	const endpoint = `/search/multi?${params.toString()}`;

	try {
		const data = await tmdbFetch<TMDBResponse<any>>(endpoint, {
			revalidate: CACHE_DURATIONS.SHORT, // Search results change frequently
		});

		// Filter to only movies and TV shows
		return {
			...data,
			results: data.results.filter(
				(item: any) => item.media_type === 'movie' || item.media_type === 'tv'
			),
		};
	} catch (error) {
		console.error('Error searching TMDB:', error);
		return { results: [], page: 1, total_pages: 0, total_results: 0 };
	}
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

export async function discoverMedia(options: DiscoverOptions = {}) {
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
		return await tmdbFetch<TMDBResponse<any>>(endpoint, {
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
): Promise<any> {
	const endpoint = `/tv/${showId}/season/${seasonNumber}?language=en-US`;

	try {
		return await tmdbFetch<any>(endpoint, {
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
) {
	const endpoint = `/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?language=en-US&append_to_response=credits,images`;

	try {
		return await tmdbFetch<any>(endpoint, {
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
	shows: any[],
	type: MediaType,
	maxItems: number = 10
): Promise<any[]> {
	try {
		const topShows = shows.slice(0, maxItems);

		// Fetch details in parallel with error handling
		const detailsPromises = topShows.map((show) =>
			fetchDetailsTMDB(show.id.toString(), type).catch(() => show)
		);

		const detailsResults = await Promise.allSettled(detailsPromises);

		const enhancedShows = detailsResults.map((result, index) => {
			if (result.status === 'fulfilled' && result.value) {
				return { ...topShows[index], ...result.value };
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
	} catch (error: any) {
		throw new Error('Failed to fetch shows: ' + error.message);
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
