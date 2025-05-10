import './globals.css';
import { ThemeProvider } from '@/components/providers/Provider';
import TanstackQueryProvider from '@/components/providers/TanstackQueryProvider';
import type { Metadata, Viewport } from 'next';

export const generateMetadata = (): Metadata => ({
	title: 'Watvh TV - Stream Movies, TV Shows, and Anime',
	description:
		'Discover and stream your favorite movies, TV series, and anime on Watvh TV. Enjoy unlimited entertainment with our vast library of content.',
	keywords: ['streaming', 'movies', 'TV shows', 'anime', 'entertainment', 'Watvh TV'],
	authors: [{ name: 'Watvh TV Team' }],
	creator: 'Watvh TV',
	publisher: 'Watvh TV',
	openGraph: {
		title: 'Watvh TV - Your Ultimate Streaming Destination',
		description:
			'Stream the latest movies, binge-worthy TV shows, and popular anime series on Watvh TV. Start watching now!',
		url: 'https://www.watvh.vercel.app',
		siteName: 'Watvh TV',
		locale: 'en_US',
		type: 'website',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
});

export const generateViewport = (): Viewport => ({
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<TanstackQueryProvider>{children}</TanstackQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
