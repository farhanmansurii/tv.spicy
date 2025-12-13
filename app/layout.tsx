import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import TanstackQueryProvider from '@/components/providers/tanstack-query-provider';
import SidebarProvider from '@/components/providers/sidebar-provider';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

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
	other: {
		'google-fonts':
			'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
	},
});

const inter = Inter({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-inter',
});

export const generateViewport = (): Viewport => ({
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={inter.variable}>
			<body className="pt-20">
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
