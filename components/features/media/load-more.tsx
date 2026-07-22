'use client';

import { useEffect, useState } from 'react';
import { fetchGenreByIdFromApi } from '@/lib/api/tmdb-row-client';
import { Show } from '@/lib/types';
import MediaRow from './row/media-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';

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
	}, [searchParams?.id, searchParams?.type]);

	if (!searchParams?.type || !searchParams?.id) {
		return <MediaLoader layout="grid" isVertical />;
	}

	if (isLoading) {
		return <MediaLoader layout="grid" isVertical />;
	}

	// Normalize type for MediaRow
	const normalizedType = searchParams.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';

	return (
		<div className="space-y-10">
			<MediaRow
				isVertical={true}
				text=""
				shows={data}
				gridLayout={true}
				type={normalizedType}
			/>
			{hasMore && (
				<div className="flex justify-center py-4">
					<button
						type="button"
						onClick={loadNextPage}
						disabled={isLoadingMore}
						className="rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.1] disabled:cursor-wait disabled:opacity-50"
					>
						{isLoadingMore ? 'Loading…' : 'Load more'}
					</button>
				</div>
			)}
		</div>
	);
}

export default LoadMore;
