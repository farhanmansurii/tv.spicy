'use client';
import React, { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';
import Episode from '../container/Episode';
import SeasonTabs from '../container/Seasons';
import { fetchDetails, fetchMovieLinks } from '@/lib/utils';
import { TVContainer } from './TVContainer';
import RowLoader from '../loading/RowLoader';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import SeasonsTabLoader from '../container/SeasonsTabLoader';

interface ShowContainerProps {
	type: string;
	id: string;
}

const ShowContainer: React.FC<ShowContainerProps> = ({ type, id }) => {
	const {
		data: showData,
		isLoading: showDataLoading,
		isError: showDataError,
	} = useQuery({
		queryKey: ['showData', id, type],
		queryFn: async () => {
			try {
				return await fetchDetails(id, type);
			} catch (error) {
				console.error('Failed to fetch show data:', error);
			}
		},
	});
	const {
		data: streamingLinks,
		isLoading: streamingLinksLoading,
		isError: streamingLinksError,
	} = useQuery({
		queryKey: ['profile', showData?.id],
		queryFn: async () => {
			try {
				const res = await new Promise((resolve, reject) => {
					fetchMovieLinks(id, showData.id, (err: any, res: any) => {
						if (err) reject(err);
						resolve(res);
					});
				});
				return res;
			} catch (error) {
				console.log('log', error);
				throw error;
			}
		},
		enabled: type === 'movie',
	});

	return (
		<div className="mx-auto max-w-3xl w-full px-1 md:px-0 -full">
			{type === 'tv' ? (
				showDataLoading ? (
					<SeasonsTabLoader />
				) : (
					<>
						<TVContainer tv={showData} tv_id={id} />
						<SeasonTabs
							seasons={showData?.seasons || null}
							id={showData?.id || null}
							tv_id={id}
						/>
					</>
				)
			) : (
				<div className="mx-auto my-8 max-w-3xl w-full space-y-8 px-3 md:space-y-12 md:px-0">
					{/* {showDataLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className=" h-12 mb-2 w-36"></Skeleton>
              <Skeleton className="aspect-video w-full   mx-auto " />
            </div>
          ) : ( */}
					<Episode
						episodeId={showData?.episodeId || ''}
						id={showData?.id || id || ''}
						movieID={id}
						type={type}
					/>
					{/* )} */}
				</div>
			)}
		</div>
	);
};

export default ShowContainer;
