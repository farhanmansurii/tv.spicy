// lib/tmdbSearchUtils.ts
const BASE_URL = 'https://api.themoviedb.org/3';

// Get API credentials from environment variables
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';
const TMDB_BEARER_TOKEN =
	process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN || process.env.TMDB_BEARER_TOKEN || '';

// Validate API credentials
if (!TMDB_BEARER_TOKEN && !TMDB_API_KEY) {
	console.warn(
		'⚠️  TMDB API credentials not found. Please set NEXT_PUBLIC_TMDB_BEARER_TOKEN or NEXT_PUBLIC_TMDB_API_KEY in your environment variables.'
	);
}

const tmdbFetch = async (url: string) => {
	const urlObj = new URL(`${BASE_URL}${url}`);

	// Add language if not present
	if (!urlObj.searchParams.has('language')) {
		urlObj.searchParams.append('language', 'en-US');
	}

	// Add API key if Bearer token is not available
	if (!TMDB_BEARER_TOKEN && TMDB_API_KEY && !urlObj.searchParams.has('api_key')) {
		urlObj.searchParams.append('api_key', TMDB_API_KEY);
	}

	// Prepare headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	// Use Bearer token if available
	if (TMDB_BEARER_TOKEN) {
		headers['Authorization'] = `Bearer ${TMDB_BEARER_TOKEN}`;
	}

	const res = await fetch(urlObj.toString(), { headers });
	if (!res.ok) throw new Error(`TMDB fetch failed: ${res.statusText}`);
	return res.json();
};

export async function fetchGenres(type: 'movie' | 'tv') {
	const data = await tmdbFetch(`/genre/${type}/list?`);
	return data.genres;
}

export async function searchTMDB(query: string, page: number = 1) {
	const url = new URL(`${BASE_URL}/search/multi`);
	url.searchParams.append('query', query);
	url.searchParams.append('page', page.toString());
	url.searchParams.append('include_adult', 'false');

	// Add API key if Bearer token is not available
	if (!TMDB_BEARER_TOKEN && TMDB_API_KEY) {
		url.searchParams.append('api_key', TMDB_API_KEY);
	}

	// Prepare headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	// Use Bearer token if available
	if (TMDB_BEARER_TOKEN) {
		headers['Authorization'] = `Bearer ${TMDB_BEARER_TOKEN}`;
	}

	const res = await fetch(url.toString(), { headers });

	if (!res.ok) {
		throw new Error('Failed to find shows');
	}

	const data = await res.json();
	return {
		...data,
		results: data.results.filter(
			(item: any) => item.media_type === 'movie' || item.media_type === 'tv'
		),
	};
}

interface DiscoverOptions {
	type?: 'movie' | 'tv';
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

	// Add API key if Bearer token is not available
	if (!TMDB_BEARER_TOKEN && TMDB_API_KEY) {
		params.append('api_key', TMDB_API_KEY);
	}

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

	const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';

	// Prepare headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	// Use Bearer token if available
	if (TMDB_BEARER_TOKEN) {
		headers['Authorization'] = `Bearer ${TMDB_BEARER_TOKEN}`;
	}

	const res = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`, { headers });

	if (!res.ok) {
		throw new Error('Failed to discover media');
	}

	return res.json();
}
