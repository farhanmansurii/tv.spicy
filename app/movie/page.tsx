import dynamic from 'next/dynamic';
import Container from '@/components/shared/containers/container';
import DataRow from '@/components/features/media/row/data-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { fetchGenres, fetchRowData, fetchHeroItemsWithDetails } from '@/lib/api';
import { Metadata } from 'next';
import React, { Suspense } from 'react';
import HeroCarousel, {
	type HeroCarouselProps,
} from '@/components/features/media/carousel/hero-carousel';
import type { Genre } from '@/lib/types/tmdb';
import type { Show } from '@/lib/types';
import ProgressiveGenreRows from '@/components/features/media/genre/progressive-genre-rows';

export const revalidate = 86400;

export const metadata: Metadata = {
	title: 'Movies | Spicy TV',
	description: 'Watch any TV or Movies with Spicy TV',
	openGraph: {
		title: 'Movies | Spicy TV',
		description: 'Watch any TV or Movies with Spicy TV',
		images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: 'Spicy TV' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Movies | Spicy TV',
		description: 'Watch any TV or Movies with Spicy TV',
		images: ['/icon-512x512.png'],
	},
};

const WatchList = dynamic(() => import('@/components/features/watchlist/watch-list'));
const GenreGrid = dynamic(() => import('@/components/features/media/genre/genre-grid'), {
	loading: () => <div className="h-96 bg-zinc-800/50 animate-pulse rounded-md" />,
});

export default async function Page() {
	let genres: Genre[] = [];
	let topRatedMovies = [];
	let heroShows: Array<Show & { media_type?: 'movie' | 'tv' }> = [];

	try {
		[genres, topRatedMovies] = await Promise.all([
			fetchGenres('movie'),
			fetchRowData('movie/top_rated'),
		]);

		// Fetch full details (with logos) for hero items
		heroShows = (await fetchHeroItemsWithDetails(topRatedMovies, 'movie', 5)) as Array<
			Show & { media_type?: 'movie' | 'tv' }
		>;
	} catch (error) {
		console.error('Failed to load movie page data:', error);
	}

	return (
		<>
			<HeroCarousel shows={heroShows as unknown as HeroCarouselProps['shows']} type="movie" />

			<Container>
				<div className="flex flex-col space-y-4 md:space-y-6">
					<Suspense fallback={<MediaLoader withHeader className="min-h-[280px]" />}>
						<WatchList type="movie" />
					</Suspense>

					<DataRow
						endpoint="trending/movie/week"
						text="Top Movies"
						showRank={false}
						type="movie"
					/>

					<DataRow
						endpoint="movie/top_rated"
						text="Top Rated Movies"
						showRank={true}
						type="movie"
					/>

					<ProgressiveGenreRows genres={genres} type="movie" />
				</div>

				{genres.length > 0 && (
					<Suspense
						fallback={<div className="h-96 bg-zinc-800/50 animate-pulse rounded-md" />}
					>
						<GenreGrid genres={genres} type="movie" />
					</Suspense>
				)}
			</Container>
		</>
	);
}
