import dynamic from 'next/dynamic';
import Container from '@/components/shared/containers/container';
import DataRow from '@/components/features/media/row/data-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';
import { connection } from 'next/server';
import { Metadata } from 'next';
import React, { Suspense } from 'react';
import { EditorialHero } from '@/components/features/home/editorial-hero';
import type { HeroCarouselProps } from '@/components/features/media/carousel/hero-carousel';
import type { Genre } from '@/lib/types/tmdb';
import type { Show } from '@/lib/types';
import type { TMDBBaseMedia } from '@/lib/types/tmdb';
import ProgressiveGenreRows from '@/components/features/media/genre/progressive-genre-rows';
import {
	getCachedRow,
	getCachedGenres,
	getCachedGenreRow,
	getCachedHeroItems,
} from '@/lib/api/catalog-cache';

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

export default async function Page() {
	let genres: Genre[] = [];
	let topRatedMovies: TMDBBaseMedia[] = [];
	let trendingMovies: TMDBBaseMedia[] = [];
	let heroShows: Array<Show & { media_type?: 'movie' | 'tv' }> = [];
	let initialDataByGenre: Record<number, unknown[]> = {};

	try {
		[genres, topRatedMovies, trendingMovies] = (await Promise.all([
			getCachedGenres('movie'),
			getCachedRow('movie/top_rated'),
			getCachedRow('trending/movie/week'),
		])) as [Genre[], TMDBBaseMedia[], TMDBBaseMedia[]];

		if (genres.length === 0 || topRatedMovies.length === 0) throw new Error('Empty catalog');

		heroShows = (await getCachedHeroItems(topRatedMovies, 'movie', 5)) as Array<
			Show & { media_type?: 'movie' | 'tv' }
		>;

		const settled = await Promise.allSettled(
			genres.map((genre) => getCachedGenreRow('movie', String(genre.id)))
		);
		settled.forEach((result, index) => {
			if (result.status === 'fulfilled') initialDataByGenre[genres[index].id] = result.value;
		});
	} catch (error) {
		console.error('Failed to load movie page data:', error);
		// A degraded or error render must never be cached.
		await connection();
		return (
			<PageFetchError
				title="Couldn’t load movies"
				description="We couldn’t reach the catalog. Try again in a moment."
			/>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			<div className="-mt-16 lg:mt-0">
				<EditorialHero shows={heroShows as unknown as HeroCarouselProps['shows']} type="movie" />
			</div>

			<Container className="relative z-10 w-full pt-7 md:pt-12">
				<div className="flex flex-col">
					<Suspense fallback={<MediaLoader withHeader className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />}>
						<WatchList type="movie" />
					</Suspense>

					<DataRow
						rowNumber={1}
						endpoint="trending/movie/week"
						text="Top Movies"
						showRank={false}
						type="movie"
						initialData={trendingMovies}
					/>

					<DataRow
						rowNumber={2}
						endpoint="movie/top_rated"
						text="Top Rated Movies"
						showRank={true}
						type="movie"
						initialData={topRatedMovies}
					/>

					<ProgressiveGenreRows
						genres={genres}
						type="movie"
						startRowNumber={3}
						initialDataByGenre={initialDataByGenre}
					/>
				</div>
			</Container>
		</div>
	);
}
