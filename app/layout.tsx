import './globals.css';
import { ThemeProvider } from '@/components/layout/providers/theme-provider';
import TanstackQueryProvider from '@/components/providers/tanstack-query-provider';
import SidebarProvider from '@/components/providers/sidebar-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthSync } from '@/components/auth/auth-sync';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata, Viewport } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spicy-tv.vercel.app';

export const generateMetadata = (): Metadata => ({
	metadataBase: new URL(SITE_URL),
	title: 'Spicy TV - Stream Movies and TV Shows',
	description:
		'Discover and stream your favorite movies and TV series on Spicy TV. Enjoy unlimited entertainment with our vast library of content.',
	applicationName: 'Spicy TV',
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
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	}
});

export const generateViewport = (): Viewport => ({
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased selection:bg-primary/30">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<AuthProvider>
						<TanstackQueryProvider>
							<SidebarProvider>
								<AuthSync />
								{children}
							</SidebarProvider>
							<Toaster />
						</TanstackQueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
