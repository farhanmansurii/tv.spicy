
export interface NavigationItem {
	label: string;
	href: string;
	description?: string;
}

export const navigationItems: NavigationItem[] = [
	{
		label: 'Home',
		href: '/',
	},
	{
		label: 'Movies',
		href: '/movie',

	},
	{
		label: 'TV Series',
		href: '/tv',

	},
	{
		label: 'Library',
		href: '/library',
	},
];

export function getNavigationItems(options: { isSignedIn: boolean }) {
	void options;
	return navigationItems;
}
