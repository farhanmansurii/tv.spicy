export type TMDBMediaType = 'movie' | 'tv';

export interface Genre {
	id: number;
	name: string;
}

export interface SpokenLanguage {
	english_name?: string;
	iso_639_1: string;
	name: string;
}

export interface TMDBListResponse<T> {
	results: T[];
	page: number;
	total_pages: number;
	total_results: number;
}

export interface TMDBImage {
	aspect_ratio: number;
	file_path: string;
	height: number;
	width: number;
	iso_639_1: string | null;
	vote_average: number;
	vote_count: number;
}

export interface TMDBImagesResponse {
	backdrops: TMDBImage[];
	posters: TMDBImage[];
	logos: TMDBImage[];
}

export interface TMDBVideo {
	id: string;
	key: string;
	name: string;
	site: string;
	type: string;
	official?: boolean;
	published_at?: string;
	size?: number;
}

export interface TMDBVideosResponse {
	results: TMDBVideo[];
}

export interface TMDBCastMember {
	id: number;
	name: string;
	character?: string;
	order?: number;
	profile_path?: string | null;
}

export interface TMDBCrewMember {
	id: number;
	name: string;
	department?: string;
	job?: string;
	profile_path?: string | null;
}

export interface TMDBCreditsResponse {
	cast: TMDBCastMember[];
	crew: TMDBCrewMember[];
}

export interface TMDBBaseMedia {
	id: number;
	adult?: boolean;
	backdrop_path?: string | null;
	genre_ids?: number[];
	original_language?: string;
	overview?: string | null;
	popularity?: number;
	poster_path?: string | null;
	vote_average?: number;
	vote_count?: number;
	media_type?: TMDBMediaType;
}

export interface TMDBMovie extends TMDBBaseMedia {
	title?: string;
	original_title?: string;
	release_date?: string;
	video?: boolean;
	runtime?: number | null;
	budget?: number;
	revenue?: number;
	tagline?: string;
	genres?: Genre[];
	spoken_languages?: SpokenLanguage[];
}

export interface TMDBTVShow extends TMDBBaseMedia {
	name?: string;
	original_name?: string;
	first_air_date?: string;
	last_air_date?: string;
	number_of_seasons?: number;
	number_of_episodes?: number;
	status?: string;
	next_episode_to_air?: {
		air_date?: string;
		episode_number?: number;
		season_number?: number;
		name?: string;
		id?: number;
	} | null;
	tagline?: string;
	genres?: Genre[];
	spoken_languages?: SpokenLanguage[];
	episode_run_time?: number[];
}

export interface TMDBEpisode {
	air_date?: string;
	episode_number: number;
	season_number: number;
	id: number;
	name: string;
	overview?: string;
	still_path?: string | null;
	runtime?: number | null;
	vote_average?: number;
	vote_count?: number;
	crew?: TMDBCrewMember[];
	guest_stars?: TMDBCastMember[];
}

export interface TMDBEpisodeDetails extends TMDBEpisode {
	credits?: TMDBCreditsResponse;
	images?: TMDBImagesResponse;
}

export interface TMDBSeasonDetails {
	id: number;
	name: string;
	overview?: string;
	air_date?: string;
	season_number: number;
	poster_path?: string | null;
	episodes: TMDBEpisode[];
}
