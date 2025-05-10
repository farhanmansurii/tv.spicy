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

export async function searchTMDB(query: string, type?: 'movie' | 'tv') {
	const res = await fetch(
		`https://api.themoviedb.org/3/search/multi?api_key=e3ca0f283f1ab903fd5e2324faadd88e&query=${encodeURIComponent(
			query
		)}`
	);

	if (!res.ok) {
		throw new Error('Failed to find shows');
	}

	const data = await res.json();
	return {
		...data,

		results: data.results.filter(
			(item: any) =>
				(type ? item.media_type === type : true) &&
				(item.media_type === 'movie' || item.media_type === 'tv')
		),
	};
}
