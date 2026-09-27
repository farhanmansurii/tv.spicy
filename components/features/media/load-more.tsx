'use client';

import { useEffect, useState } from 'react';
import { fetchGenreByIdFromApi } from '@/lib/api/tmdb-row-client';
import { Show } from '@/lib/types';
import MediaRow from './row/media-row';
import { Button } from '@/components/ui/button';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';

function LoadMore(props: { params: any }) {
	const { params } = props;

	const [data, setData] = useState<Show[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [searchParams, setSearchParams] = useState<{
		type?: string;
		id?: string;
		title?: string;
	} | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasInitialLoad, setHasInitialLoad] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [hasFailed, setHasFailed] = useState(false);

	// Handle async params
	useEffect(() => {
		const loadParams = async () => {
			const resolvedParams = await params;
			const resolvedSearchParams = await resolvedParams?.searchParams;
			if (resolvedSearchParams) {
				setSearchParams(resolvedSearchParams);
			}
		};
		loadParams();
	}, [params]);

	// Fetch first page immediately when searchParams are available
	useEffect(() => {
		if (searchParams?.type && searchParams?.id && !hasInitialLoad) {
			setIsLoading(true);
			setHasInitialLoad(true);
			setCurrentPage(1);

			const fetchFirstPage = async () => {
				try {
					// Normalize type to 'movie' or 'tv'
					const normalizedType =
						searchParams.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';
					const res = await fetchGenreByIdFromApi(normalizedType, searchParams.id!, 1);
					setData((res as Show[]) || []);
				} catch (error) {
					console.error('Error loading genre data:', error);
					setHasFailed(true);
					setHasMore(false);
				} finally {
					setIsLoading(false);
				}
			};

			fetchFirstPage();
		}
	}, [searchParams, hasInitialLoad]);

	const loadNextPage = async () => {
		if (!searchParams?.type || !searchParams.id || isLoadingMore || !hasMore) return;
		setIsLoadingMore(true);
		const nextPage = currentPage + 1;
		try {
			const normalizedType = searchParams.type.toLowerCase() === 'movie' ? 'movie' : 'tv';
			const res = await fetchGenreByIdFromApi(normalizedType, searchParams.id, nextPage);
			const nextBatch = (res as Show[]) || [];
			if (nextBatch.length === 0) {
				setHasMore(false);
				return;
			}
			setData((prev) => [...prev, ...nextBatch]);
			setCurrentPage(nextPage);
		} catch (error) {
			console.error('Error loading more:', error);
			setHasFailed(true);
			setHasMore(false);
		} finally {
			setIsLoadingMore(false);
		}
	};

	// Reset when params change
	useEffect(() => {
		setCurrentPage(1);
		setData([]);
		setHasInitialLoad(false);
		setIsLoadingMore(false);
		setHasMore(true);
		setHasFailed(false);
	}, [searchParams?.id, searchParams?.type]);

	if (!searchParams?.type || !searchParams?.id || isLoading) {
		return <MediaLoader layout="grid" isVertical itemCount={12} />;
	}

	// Normalize type for MediaRow
	const normalizedType = searchParams.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';

	return (
		<div>
			{hasFailed && data.length === 0 ? (
				<PageFetchError
					title="The projector jammed."
					description="We couldn’t load this collection from the shelf. Try again in a moment."
					className="px-0"
				/>
			) : (
				<>
					{/* The page header above already names this collection, so the grid
					    carries no second heading. */}
					<MediaRow
						isVertical={true}
						shows={data}
						gridLayout={true}
						hideHeader
						type={normalizedType}
					/>
					{hasMore && data.length > 0 && (
						<div className="mt-10 flex justify-center">
							<Button
								type="button"
								variant="ghost"
								onClick={loadNextPage}
								disabled={isLoadingMore}
								aria-busy={isLoadingMore}
							>
								{isLoadingMore ? 'Loading…' : 'Load more'}
								{!isLoadingMore && (
									<span className="font-mono text-xs tracking-meta text-dim tabular-nums">
										{data.length} shown
									</span>
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

export default LoadMore;
