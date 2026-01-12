import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Search | Spicy TV',
	description: 'Search across movies and TV shows on Spicy TV.',
	openGraph: {
		title: 'Search | Spicy TV',
		description: 'Search across movies and TV shows on Spicy TV.',
		images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: 'Spicy TV' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Search | Spicy TV',
		description: 'Search across movies and TV shows on Spicy TV.',
		images: ['/icon-512x512.png'],
	},
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
	return children;
}
