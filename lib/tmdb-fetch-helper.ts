import axios from 'axios';
import { Episode, Show } from './types';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'e3ca0f283f1ab903fd5e2324faadd88e';

const fetchData = async (endpoint: string, params: object = {}) => {
	try {
		const url = new URL(`${BASE_URL}${endpoint}`);
		Object.entries({ ...params, api_key: API_KEY }).forEach(([key, value]) =>
			url.searchParams.append(key, String(value))
		);

		const response = await axios.get(url.toString());
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
): Promise<Episode[]> => {
	const data = await fetchData(`/tv/${showId}/season/${seasonNumber}`, { language: 'en-US' });
	if (data.episodes) {
		return data.episodes;
	} else {
		throw new Error('No episodes data found in the response');
	}
};
