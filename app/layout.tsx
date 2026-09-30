import './globals.css';
import { DM_Sans, Instrument_Serif } from 'next/font/google';
import TanstackQueryProvider from '@/components/providers/tanstack-query-provider';
import SidebarProvider from '@/components/providers/sidebar-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthSync } from '@/components/auth/auth-sync';
import { Toaster } from '@/components/ui/sonner';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import type { Metadata, Viewport } from 'next';
import { DetailScrollRestoration } from '@/components/providers/detail-scroll-restoration';
import { Suspense } from 'react';

const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
});
const instrumentSerif = Instrument_Serif({
	subsets: ['latin'],
	variable: '--font-display',
	weight: '400',
	display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spicy-tv.vercel.app';

export const generateMetadata = (): Metadata => ({
	metadataBase: new URL(SITE_URL),
	title: 'Spicy TV - Stream Movies and TV Shows',
	description:
		'Discover and stream your favorite movies and TV series on Spicy TV. Enjoy unlimited entertainment with our vast library of content.',
	applicationName: 'Spicy TV',
	manifest: '/manifest.json',
	keywords: ['streaming', 'movies', 'TV shows', 'entertainment', 'Spicy TV'],
	authors: [{ name: 'Spicy TV Team' }],
	creator: 'Spicy TV',
	publisher: 'Spicy TV',
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: 'Spicy TV - Your Ultimate Streaming Destination',
		description:
			'Stream the latest movies and binge-worthy TV shows on Spicy TV. Start watching now!',
		url: SITE_URL,
		siteName: 'Spicy TV',
		locale: 'en_US',
		type: 'website',
		images: [
			{
				url: '/icon-512x512.png',
				width: 512,
				height: 512,
				alt: 'Spicy TV',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Spicy TV - Stream Movies and TV Shows',
		description:
			'Discover and stream your favorite movies and TV series on Spicy TV. Enjoy unlimited entertainment with our vast library of content.',
		images: ['/icon-512x512.png'],
	},
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
		},
	},
});

export const generateViewport = (): Viewport => ({
	width: 'device-width',
	initialScale: 1,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={`dark ${dmSans.variable} ${instrumentSerif.variable} antialiased`}
		>
			<head>
				<link rel="dns-prefetch" href="https://image.tmdb.org" />
				<link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
			</head>
			<body className="antialiased font-sans">
				<AuthProvider>
					<TanstackQueryProvider>
						<AuthSync />
						{/* Sidebar chrome reads the route (usePathname) for active states;
						    so it suspends for dynamic params instead of blocking the shell. */}
						<Suspense fallback={null}>
							<SidebarProvider>
								<DetailScrollRestoration />
								<AccessibilityProvider>{children}</AccessibilityProvider>
							</SidebarProvider>
						</Suspense>
					</TanstackQueryProvider>
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	);
}
