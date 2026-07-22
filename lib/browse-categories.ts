export interface BrowseCategory {
	slug: string;
	endpoint: string;
	title: string;
	type: 'tv' | 'movie';
	description: string;
}

export const BROWSE_CATEGORIES = {
	'popular-tonight': {
		slug: 'popular-tonight',
		endpoint: 'tv/popular',
		title: 'Popular Tonight',
		type: 'tv',
		description: 'Popular shows audiences are watching right now.',
	},
	'binge-worthy-series': {
		slug: 'binge-worthy-series',
		endpoint: 'trending/tv/week',
		title: 'Binge-Worthy Series',
		type: 'tv',
		description: 'The series capturing the most attention this week.',
	},
	'crowd-favorites-tv': {
		slug: 'crowd-favorites-tv',
		endpoint: 'tv/popular',
		title: 'Crowd Favorites',
		type: 'tv',
		description: 'Popular shows loved by audiences around the world.',
	},
	'airing-this-week': {
		slug: 'airing-this-week',
		endpoint: 'tv/on_the_air',
		title: 'Airing This Week',
		type: 'tv',
		description: 'Shows with new episodes airing this week.',
	},
	'critically-acclaimed-tv': {
		slug: 'critically-acclaimed-tv',
		endpoint: 'tv/top_rated',
		title: 'Critically Acclaimed TV',
		type: 'tv',
		description: 'The highest-rated television selected by viewers and critics.',
	},
	'blockbuster-hits': {
		slug: 'blockbuster-hits',
		endpoint: 'trending/movie/week',
		title: 'Blockbuster Hits',
		type: 'movie',
		description: 'The movies making the biggest impact this week.',
	},
	'fresh-in-theaters': {
		slug: 'fresh-in-theaters',
		endpoint: 'movie/now_playing',
		title: 'Fresh in Theaters',
		type: 'movie',
		description: 'Movies currently playing in theaters.',
	},
	'cult-classics-fan-favorites': {
		slug: 'cult-classics-fan-favorites',
		endpoint: 'movie/popular',
		title: 'Cult Classics & Fan Favorites',
		type: 'movie',
		description: 'Popular movies audiences keep coming back to.',
	},
	'cinema-hall-of-fame': {
		slug: 'cinema-hall-of-fame',
		endpoint: 'movie/top_rated',
		title: 'Cinema Hall of Fame',
		type: 'movie',
		description: 'The highest-rated films across generations.',
	},
} as const satisfies Record<string, BrowseCategory>;

export type BrowseCategorySlug = keyof typeof BROWSE_CATEGORIES;

export function getBrowseCategory(slug: string): BrowseCategory | null {
	return BROWSE_CATEGORIES[slug as BrowseCategorySlug] ?? null;
}
