import dynamic from 'next/dynamic';
import Container from '@/components/shared/containers/container';
import FetchAndRenderRow from '@/components/features/media/row/fetch-and-render-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { fetchGenres, fetchRowData, fetchHeroItemsWithDetails } from '@/lib/api';
import { Metadata } from 'next';
import React, { Suspense } from 'react';
import HeroCarousel from '@/components/features/media/carousel/hero-carousel';

export const metadata: Metadata = {
	title: 'Movies | Spicy TV',
	description: 'Watch any TV / Movies / Anime with Spicy TV',
};

export const revalidate = 604800;

const WatchList = dynamic(() => import('@/components/features/watchlist/watch-list'));
const GenreGrid = dynamic(() => import('@/components/features/media/genre/genre-grid'), {
	loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />,
});

export default async function Page() {
	const genres = await fetchGenres('movie');
	const topRatedMovies = await fetchRowData('movie/top_rated');

	// Fetch full details (with logos) for hero items
	const heroShows = await fetchHeroItemsWithDetails(topRatedMovies, 'movie', 10);

	return (
		<>
			<HeroCarousel shows={heroShows} type="movie" />
			<Container>
			<div className="flex flex-col space-y-4 md:space-y-6">
					<Suspense fallback={<WatchlistLoader />}>
						<WatchList type="movie" />
					</Suspense>

					<FetchAndRenderRow
						apiEndpoint="trending/movie/week"
						text="Top Movies"
						showRank={false}
						type="movie"
					/>

					<FetchAndRenderRow
						apiEndpoint="movie/top_rated"
						text="Top Rated Movies"
						showRank={true}
						type="movie"
					/>

					{genres?.map((genre: any) => (
						<Suspense key={genre.id} fallback={<RowLoader withHeader key={genre.id} />}>
							<FetchAndRenderRow
								showRank={false}
								type="movie"
								apiEndpoint={{ id: genre.id, type: 'movie' }}
								text={genre.name}
								isGenre={true}
							/>
						</Suspense>
					))}
				</div>

				{genres.length > 0 && (
					<Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-md" />}>
						<GenreGrid genres={genres} type="movie" />
					</Suspense>
				)}
			</Container>
		</>
	);
}
