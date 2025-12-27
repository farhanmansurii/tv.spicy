import axios from 'axios';
import { Episode, Show } from './types';

const BASE_URL = 'https://api.themoviedb.org/3';

// Get API credentials from environment variables
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';
const TMDB_BEARER_TOKEN = process.env.NEXT_PUBLIC_TMDB_BEARER_TOKEN || process.env.TMDB_BEARER_TOKEN || '';

// Validate API credentials
if (!TMDB_BEARER_TOKEN && !TMDB_API_KEY) {
	console.warn(
		'⚠️  TMDB API credentials not found. Please set NEXT_PUBLIC_TMDB_BEARER_TOKEN or NEXT_PUBLIC_TMDB_API_KEY in your environment variables.'
	);
}

const fetchData = async (endpoint: string, params: object = {}) => {
	try {
		const url = new URL(`${BASE_URL}${endpoint}`);

		// Add params
		Object.entries(params).forEach(([key, value]) =>
			url.searchParams.append(key, String(value))
		);

		// Add API key if Bearer token is not available
		if (!TMDB_BEARER_TOKEN && TMDB_API_KEY && !url.searchParams.has('api_key')) {
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

		const response = await axios.get(url.toString(), { headers });
		return response.data;
	} catch (error) {
		console.error(`Error fetching data from ${endpoint}:`, error);
		throw error;
	}
};

export const fetchRowData = async (link: string) => {
	const data = await fetchData(`/${link}`, {
		language: 'en-US',
		include_adult: false,
		include_video: false,
	});
	return data.results;
};

export const fetchDetailsTMDB = async (id: string, type: string) => {
	return fetchData(`/${type}/${id}`);
};

export const fetchRecommendations = async (id: string, showType: string, type: string) => {
	return fetchData(`/${showType}/${id}/${type}`, { language: 'en-US', page: 1 });
};

export const fetchShowData = async (endpoint: string) => {
	const data = await fetchData(`/${endpoint}`, {
		language: 'en-US',
		sort_by: 'popularity.desc',
		include_adult: false,
		include_video: false,
		watch_region: 'US',
		page: 1,
	});
	return data.results;
};

export const getNewAndPopularShows = async () => {
	try {
		const [topRatedTV, topRatedMovie, trendingMovie, trendingTv] = await Promise.all([
			fetchShowData('tv/top_rated'),
			fetchShowData('movie/top_rated'),
			fetchShowData('trending/movie/week'),
			fetchShowData('trending/tv/week'),
		]);

		return { topRatedTV, topRatedMovie, trendingTv, trendingMovie };
	} catch (error: any) {
		throw new Error('Failed to fetch shows: ' + error.message);
	}
};

export const searchShows = async (query: string) => {
	const data = await fetchData('/search/multi', { query: encodeURIComponent(query) });
	const popularShows = data.results.sort((a: Show, b: Show) => b.popularity - a.popularity);
	return { results: popularShows };
};

export const fetchCarousalData = async (category: string, type: string) => {
	return fetchShowData('tv/top_rated');
};

export const fetchGenres = async (type: string) => {
	const data = await fetchData(`/genre/${type}/list`, { language: 'en' });
	return data.genres;
};

export const fetchGenreById = async (type: string, id: string, page: number = 1) => {
	const params = {
		include_adult: 'true',
		include_video: 'false',
		language: 'en-US',
		page: page.toString(),
		sort_by: 'popularity.desc',
		with_genres: id,
	};
	const data = await fetchData(`/discover/${type}`, params);
	return data.results;
};

export const fetchSeasonEpisodes = async (
	showId: string,
	seasonNumber: number
): Promise<any> => {
	const data = await fetchData(`/tv/${showId}/season/${seasonNumber}`, { language: 'en-US' });
	return data;
};

export const fetchEpisodeDetails = async (
	showId: string,
	seasonNumber: number,
	episodeNumber: number
) => {
	const data = await fetchData(
		`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`,
		{
			language: 'en-US',
			append_to_response: 'credits,images',
		}
	);
	return data;
};
