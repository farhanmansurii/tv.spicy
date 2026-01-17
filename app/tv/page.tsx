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

export const metadata: Metadata = {
	title: 'Spicy TV',
	description: 'Watch any TV or Movies with Spicy TV',
	openGraph: {
		title: 'Spicy TV',
		description: 'Watch any TV or Movies with Spicy TV',
		images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: 'Spicy TV' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Spicy TV',
		description: 'Watch any TV or Movies with Spicy TV',
		images: ['/icon-512x512.png'],
	},
};

export const revalidate = 604800;

const RecentlyWatched = dynamic(() => import('@/components/features/watchlist/recently-watched'));
const WatchList = dynamic(() => import('@/components/features/watchlist/watch-list'));
const GenreGrid = dynamic(() => import('@/components/features/media/genre/genre-grid'), {
	loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />,
});

export default async function Page() {
	let genres: Genre[] = [];
	let topRatedTV = [];
	let heroShows: Array<Show & { media_type?: 'movie' | 'tv' }> = [];

	try {
		genres = await fetchGenres('tv');
		topRatedTV = await fetchRowData('tv/top_rated');
		// Fetch full details (with logos) for hero items
		heroShows = (await fetchHeroItemsWithDetails(topRatedTV, 'tv', 10)) as Array<
			Show & { media_type?: 'movie' | 'tv' }
		>;
	} catch (error) {
		console.error('Failed to load TV page data:', error);
	}

	return (
		<>
			<HeroCarousel shows={heroShows as unknown as HeroCarouselProps['shows']} type="tv" />

			<Container>
				<div className="flex flex-col space-y-4 md:space-y-6">
					<Suspense
						fallback={
							<MediaLoader withHeader withHeaderAction className="min-h-[280px]" />
						}
					>
						<RecentlyWatched />
					</Suspense>

					<Suspense fallback={<MediaLoader withHeader className="min-h-[280px]" />}>
						<WatchList type="tv" />
					</Suspense>

					<DataRow
						endpoint="trending/tv/week"
						text="Top TV Shows"
						showRank={false}
						type="tv"
					/>

					<DataRow
						endpoint="tv/top_rated"
						text="Top Rated TV Shows"
						showRank={true}
						type="tv"
					/>

					{genres?.map((genre) => (
						<Suspense
							key={genre.id}
							fallback={<MediaLoader withHeader key={genre.id} />}
						>
							<DataRow
								showRank={false}
								type="tv"
								endpoint={{ id: genre.id, type: 'tv' }}
								text={genre.name}
								isGenre={true}
							/>
						</Suspense>
					))}
				</div>
			</Container>

			{genres.length > 0 && (
				<Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-md" />}>
					<GenreGrid type="tv" genres={genres} />
				</Suspense>
			)}
		</>
	);
}
