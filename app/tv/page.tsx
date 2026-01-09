import dynamic from 'next/dynamic';
import Container from '@/components/shared/containers/container';
import FetchAndRenderRow from '@/components/features/media/row/fetch-and-render-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { ContinueWatchingLoader } from '@/components/shared/loaders/continue-watching-loader';
import { fetchGenres, fetchRowData, fetchHeroItemsWithDetails } from '@/lib/api';
import { Metadata } from 'next';
import React, { Suspense } from 'react';
import HeroCarousel from '@/components/features/media/carousel/hero-carousel';

export const metadata: Metadata = {
	title: 'Watvh TV',
	description: 'Watch any TV / Movies / Anime with Watvh ',
};

export const revalidate = 604800;

const RecentlyWatched = dynamic(() => import('@/components/features/watchlist/recently-watched'));
const WatchList = dynamic(() => import('@/components/features/watchlist/watch-list'));
const GenreGrid = dynamic(() => import('@/components/features/media/genre/genre-grid'), {
	loading: () => <div className="h-96 bg-muted animate-pulse rounded-md" />,
});

export default async function Page() {
	const genres = await fetchGenres('tv');
	const topRatedTV = await fetchRowData('tv/top_rated');

	// Fetch full details (with logos) for hero items
	const heroShows = await fetchHeroItemsWithDetails(topRatedTV, 'tv', 10);

	return (
		<>
			<HeroCarousel shows={heroShows} type="tv" />
			<Container>
				<div className="flex flex-col space-y-4 md:space-y-6">
					<Suspense fallback={<ContinueWatchingLoader />}>
						<RecentlyWatched />
					</Suspense>

					<Suspense fallback={<WatchlistLoader />}>
						<WatchList type="tv" />
					</Suspense>

					<FetchAndRenderRow
						apiEndpoint="trending/tv/week"
						text="Top TV Shows"
						showRank={false}
						type="tv"
					/>

					<FetchAndRenderRow
						apiEndpoint="tv/top_rated"
						text="Top Rated TV Shows"
						showRank={true}
						type="tv"
					/>

					{genres?.map((genre: any) => (
						<Suspense key={genre.id} fallback={<RowLoader withHeader key={genre.id} />}>
							<FetchAndRenderRow
								showRank={false}
								type="tv"
								apiEndpoint={{ id: genre.id, type: 'tv' }}
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
