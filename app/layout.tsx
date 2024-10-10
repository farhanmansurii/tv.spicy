import { Providers } from '@/components/providers/Provider';
import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Toaster } from '@/components/ui/toaster';
import { BackgroundGradient } from '@/components/common/BackgroundGradient';
import MinimalSocialsFooter from '@/components/common/Footer';
import { TransitionProviders } from '@/components/providers/TransitionProvider';
import TanstackQueryProvider from '@/components/providers/TanstackQueryProvider';
import { Suspense } from 'react';

export const metadata: Metadata = {
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
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
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
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" href="/icon512_maskable.png"></link>
				<meta name="theme-color" content="#e63946" />
				<meta name="referrer" content="origin" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
				/>
			</head>
			<body>
				<Providers
					themes={['redDark', 'redLight', 'light', 'dark']}
					attribute="class"
					defaultTheme="dark"
					enableSystem
				>
					<TanstackQueryProvider>
						<Suspense>
							<BackgroundGradient />
						</Suspense>
						{children}
						<Toaster />
					</TanstackQueryProvider>
				</Providers>
			</body>
		</html>
	);
}
