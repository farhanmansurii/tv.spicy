import {
	Home,
	Clapperboard,
	Tv,
	Bookmark,
	Sparkles,
	Play,
	Heart,
	Star,
	Calendar,
	JapaneseYen,
} from 'lucide-react';

export interface NavigationItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	description?: string;
	items?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
	{
		label: 'Home',
		href: '/',
		icon: Home,
	},
	{
		label: 'Movies',
		href: '/movie',
		icon: Clapperboard,
		items: [
			{
				label: 'Discover',
				description: 'Explore new movies across genres',
				href: '/discover/movie',
				icon: Sparkles,
			},
			{
				label: 'Now Playing',
				description: 'Movies currently in theaters',
				href: '/browse/now-playing-movies',
				icon: Play,
			},
			{
				label: 'Popular',
				description: 'Trending movies right now',
				href: '/browse/popular-movies',
				icon: Heart,
			},
			{
				label: 'Top Rated',
				description: 'Highest rated movies of all time',
				href: '/browse/top-rated-movies',
				icon: Star,
			},
			{
				label: 'Upcoming',
				description: 'Coming soon to theaters',
				href: '/browse/upcoming-movies',
				icon: Calendar,
			},
		],
	},
	{
		label: 'TV Series',
		href: '/tv',
		icon: Tv,
		items: [
			{
				label: 'Discover',
				description: 'Explore new TV shows across genres',
				href: '/discover/tv',
				icon: Sparkles,
			},
			{
				label: 'Airing Today',
				description: 'Shows airing today',
				href: '/browse/airing-today',
				icon: Play,
			},
			{
				label: 'On The Air',
				description: 'Currently airing shows',
				href: '/browse/on-the-air',
				icon: Tv,
			},
			{
				label: 'Popular',
				description: 'Trending TV shows right now',
				href: '/browse/popular-tv',
				icon: Heart,
			},
			{
				label: 'Top Rated',
				description: 'Highest rated TV shows of all time',
				href: '/browse/top-rated-tv',
				icon: Star,
			},
		],
	},
	{
		label: 'Library',
		href: '/library',
		icon: Bookmark,
	},
];

export function getNavigationItems(options: { isSignedIn: boolean }) {
	void options;
	return navigationItems;
}
