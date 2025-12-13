// lib/tmdbSearchUtils.ts
const API_KEY =
	'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlM2NhMGYyODNmMWFiOTAzZmQ1ZTIzMjRmYWFkZDg4ZSIsInN1YiI6IjYzMDAyNGYwN2Q0MWFhMDA3OWJkMjU3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w-Eb5kO6LneizQQA9A4VOr-0P6kqDsG4_ybU9Ym3tYo';
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbFetch = async (url: string) => {
	const res = await fetch(`${BASE_URL}${url}&api_key=${API_KEY}&language=en-US`);
	if (!res.ok) throw new Error(`TMDB fetch failed: ${res.statusText}`);
	return res.json();
};

export async function fetchGenres(type: 'movie' | 'tv') {
	const data = await tmdbFetch(`/genre/${type}/list?`);
	return data.genres;
}

export async function searchTMDB(query: string, page: number = 1) {
	const res = await fetch(
		`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
	);

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
		api_key: API_KEY,
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

	const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
	const res = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`);

	if (!res.ok) {
		throw new Error('Failed to discover media');
	}

	return res.json();
}
