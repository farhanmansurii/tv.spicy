export interface Show {
	adult: boolean;
	backdrop_path: string;
	genre_ids: number[];
	id: number;
	original_language: string;
	original_title: string;
	original_name: string;
	name: string;
	genres: any;
	tagline: string;
	media_type: string;
	overview: string;
	popularity: number;
	first_air_date: string;
	poster_path: string;
	release_date: string;
	title: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
	origin_country?: string[];
	status?: string;
	last_air_date?: string;
	number_of_seasons?: number;
	number_of_episodes?: number;
	runtime?: number;
	budget?: number;
	revenue?: number;
	spoken_languages: any;
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
	img: any;
	season: any;
	episode: any;
	title: any;
	air_date: string;
	episode_number: number;
	id: number;
	name: string;
	overview: string;
	production_code: string;
	runtime: number;
	season_number: number;
	show_id: number;
	still_path: string | null;
	vote_average: number;
	vote_count: number;
	crew: CrewMember[];
	guest_stars: CastMember[];
	tv_id: string;
}

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
	seasons: any[];
	showId: string;
	showData: Show;
}

export interface Anime {
	id: string;
	malId: number;
	title: {
		romaji: string;
		english: string;
		native: string;
		userPreferred: string;
	};
	image: string;
	imageHash: string;
	trailer: {
		id: string;
		site: 'youtube';
		thumbnail: string;
		thumbnailHash: string;
	};
	description: string;
	status: 'Ongoing' | 'Completed';
	cover: string;
	coverHash: string;
	rating: number;
	releaseDate: number;
	color: string;
	genres: string[];
	totalEpisodes: number;
	duration: number;
	type: 'TV' | 'Movie';
	recommendations: Anime[];
	relations: Anime[];
}

export interface AnimeEpisode {
	id: string;
	animeID?: string;
	animeTitle?: string;
	episode: number;
	image: string;
	title?: string;
	number: number;
	description?: string;
	time: number;
	type?: string;
}
