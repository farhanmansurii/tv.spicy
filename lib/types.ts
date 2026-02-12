import type { Genre, SpokenLanguage } from './types/tmdb';

export interface Show {
	adult: boolean;
	backdrop_path: string | null;
	genre_ids: number[];
	id: number;
	original_language: string;
	original_title: string;
	original_name: string;
	name: string;
	genres: Genre[];
	tagline: string;
	media_type: string;
	overview: string;
	popularity: number;
	first_air_date: string;
	poster_path: string | null;
	release_date: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
	origin_country?: string[];
	status?: string;
	next_episode_to_air?: {
		air_date?: string;
		episode_number?: number;
		season_number?: number;
		name?: string;
		id?: number;
	} | null;
	last_air_date?: string;
	number_of_seasons?: number;
	number_of_episodes?: number;
	runtime?: number;
	budget?: number;
	revenue?: number;
	spoken_languages: SpokenLanguage[];
}

export interface Season {
	season: number;
	isReleased: boolean;
	episodes: Episode[];
}

interface SeasonContentProps {
	episodes: Episode[];
	id: string;
	tv_id: string;
	view: 'grid' | 'list' | 'carousel';
}

export interface Episode {
	show_name: string;
	img?: string | null;
	season?: number | null;
	episode?: number | null;
	title?: string | null;
	air_date?: string;
	episode_number: number;
	id: number;
	name: string;
	overview?: string;
	production_code?: string;
	runtime?: number | null;
	season_number: number;
	show_id?: number;
	still_path?: string | null;
	vote_average?: number;
	vote_count?: number;
	crew?: Array<CrewMember | Record<string, unknown> | TMDBCrewMemberLike>;
	guest_stars?: Array<CastMember | Record<string, unknown> | TMDBCastMemberLike>;
	tv_id: string;
	[meta: string]: unknown;
}

type TMDBCrewMemberLike = {
	id: number;
	name: string;
	department?: string;
	job?: string;
	profile_path?: string | null;
};

type TMDBCastMemberLike = {
	id: number;
	name: string;
	character?: string;
	order?: number;
	profile_path?: string | null;
};

interface CrewMember {
	id: number;
	credit_id: string;
	name: string;
	department: string;
	job: string;
	profile_path: string | null;
}

interface CastMember {
	id: number;
	name: string;
	credit_id: string;
	character: string;
	order: number;
	profile_path: string | null;
}

export interface SeasonTabsProps {
	seasons: Array<{ season_number: number } & Record<string, unknown>>;
	showId: string;
	showData: Show;
}
