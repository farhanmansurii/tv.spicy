import dynamic from 'next/dynamic';
import CommonContainer from '@/components/container/CommonContainer';
import FetchAndRenderRow from '@/components/container/FetchAndRenderRow';
import RowLoader from '@/components/loading/RowLoader';
import { fetchGenres } from '@/lib/utils';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Watvh TV',
	description: 'Watch any TV / Movies / Anime with Watvh ',
};

export const revalidate = 604800;

const CarousalComponent = dynamic(() => import('@/components/common/CarousalComponent'), {
	ssr: false,
	loading: () => <div className="h-48 bg-neutral-800 animate-pulse rounded-md" />,
});
const RecentlyWatchedTV = dynamic(() => import('@/components/common/RecentlyWatched'), {
	ssr: false,
});
const WatchList = dynamic(() => import('@/components/common/WatchList'), { ssr: false });
const GenreGrid = dynamic(() => import('@/components/genre-card/genre-grid'), {
	ssr: false,
	loading: () => <div className="h-96 bg-neutral-800 animate-pulse rounded-md" />,
});

export default async function Page() {
	const genres = await fetchGenres('tv');

	return (
		<>
			<CommonContainer>
				<Suspense
					fallback={<div className="h-48 bg-neutral-800 animate-pulse rounded-md" />}
				>
					<CarousalComponent type="tv" />
				</Suspense>

				<div className="flex flex-col space-y-12">
					<Suspense fallback={null}>
						<RecentlyWatchedTV />
					</Suspense>

					<Suspense fallback={null}>
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
			</CommonContainer>

			{genres.length > 0 && (
				<Suspense
					fallback={<div className="h-96 bg-neutral-800 animate-pulse rounded-md" />}
				>
					<GenreGrid type="tv" genres={genres} />
				</Suspense>
			)}
		</>
	);
}
