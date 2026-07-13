import type {
	Genre,
	TMDBBaseMedia,
	TMDBListResponse,
	TMDBMediaType,
	TMDBMovie,
	TMDBSeasonDetails,
	TMDBTVShow,
} from '@/lib/types/tmdb';

async function fetchTMDBRoute<T>(path: string): Promise<T> {
	const response = await fetch(path);

	if (!response.ok) {
		throw new Error(`TMDB route request failed (${response.status})`);
	}

	return response.json() as Promise<T>;
}

export function fetchRowDataFromApi(endpoint: string) {
	return fetchTMDBRoute<TMDBBaseMedia[]>(
		`/api/tmdb/row?endpoint=${encodeURIComponent(endpoint)}`
	);
}

export function fetchGenreByIdFromApi(type: TMDBMediaType, genreId: string, page = 1) {
	const params = new URLSearchParams({ type, genreId, page: String(page) });
	return fetchTMDBRoute<TMDBBaseMedia[]>(`/api/tmdb/genre?${params.toString()}`);
}

export function fetchGenresFromApi(type: TMDBMediaType) {
	return fetchTMDBRoute<Genre[]>(`/api/tmdb/genres?type=${type}`);
}

export function fetchSeasonEpisodesFromApi(showId: string, season: number) {
	const params = new URLSearchParams({ showId, season: String(season) });
	return fetchTMDBRoute<TMDBSeasonDetails>(`/api/tmdb/season?${params.toString()}`);
}

export function searchTMDBFromApi(query: string, page = 1) {
	const params = new URLSearchParams({ query, page: String(page) });
	return fetchTMDBRoute<TMDBListResponse<TMDBBaseMedia>>(`/api/tmdb/search?${params.toString()}`);
}

export function fetchBasicDetailsFromApi(id: string, type: TMDBMediaType) {
	const params = new URLSearchParams({ id, type });
	return fetchTMDBRoute<TMDBMovie & TMDBTVShow>(`/api/tmdb/details?${params.toString()}`);
}
