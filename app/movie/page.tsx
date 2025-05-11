import dynamic from 'next/dynamic';
import CommonContainer from '@/components/container/CommonContainer';
import FetchAndRenderRow from '@/components/container/FetchAndRenderRow';
import RowLoader from '@/components/loading/RowLoader';
import { fetchGenres } from '@/lib/utils';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Movies | Watvh TV',
	description: 'Watch any TV / Movies / Anime with Watvh ',
};

export const revalidate = 604800;

const CarousalComponent = dynamic(() => import('@/components/common/CarousalComponent'), {
	ssr: false,
	loading: () => <div className="h-48 bg-neutral-800 animate-pulse rounded-md" />,
});
const WatchList = dynamic(() => import('@/components/common/WatchList'), { ssr: false });
const GenreGrid = dynamic(() => import('@/components/genre-card/genre-grid'), {
	ssr: false,
	loading: () => <div className="h-96 bg-neutral-800 animate-pulse rounded-md" />,
});

export default async function Page() {
	const genres = await fetchGenres('movie');

	return (
		<CommonContainer>
			<Suspense fallback={<div className="h-48 bg-neutral-800 animate-pulse rounded-md" />}>
				<CarousalComponent type="movie" />
			</Suspense>

			<div className="flex flex-col space-y-12">
				<Suspense fallback={null}>
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
				<Suspense
					fallback={<div className="h-96 bg-neutral-800 animate-pulse rounded-md" />}
				>
					<GenreGrid genres={genres} type="movie" />
				</Suspense>
			)}
		</CommonContainer>
	);
}
