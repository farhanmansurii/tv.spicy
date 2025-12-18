'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { fetchGenreById } from '@/lib/utils';
import { Show } from '@/lib/types';
import MediaRow from './row/media-row';
import GridLoader from '@/components/shared/loaders/grid-loader';

function LoadMore(props: { params: any }) {
	const { params } = props;
	const { ref, inView } = useInView();

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
					const normalizedType = searchParams.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';
					const res = await fetchGenreById(normalizedType, searchParams.id!, 1);
					setData(res || []);
				} catch (error) {
					console.error('Error loading genre data:', error);
				} finally {
					setIsLoading(false);
				}
			};

			fetchFirstPage();
		}
	}, [searchParams, hasInitialLoad]);

	// Load more pages when in view
	useEffect(() => {
		if (inView && searchParams?.type && searchParams?.id && hasInitialLoad && !isLoadingMore && data.length > 0) {
			setIsLoadingMore(true);
			const nextPage = currentPage + 1;

			const timeoutId = setTimeout(async () => {
				try {
					// Normalize type to 'movie' or 'tv'
					const normalizedType = searchParams.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';
					const res = await fetchGenreById(normalizedType, searchParams.id!, nextPage);
					if (res && res.length > 0) {
						setData((prev) => [...prev, ...res]);
						setCurrentPage(nextPage);
					}
				} catch (error) {
					console.error('Error loading more:', error);
				} finally {
					setIsLoadingMore(false);
				}
			}, 500);

			return () => clearTimeout(timeoutId);
		}
	}, [inView, searchParams, hasInitialLoad, currentPage, isLoadingMore, data.length]);

	// Reset when params change
	useEffect(() => {
		setCurrentPage(1);
		setData([]);
		setHasInitialLoad(false);
		setIsLoadingMore(false);
	}, [searchParams?.id, searchParams?.type]);

	if (!searchParams?.type || !searchParams?.id) {
		return <GridLoader />;
	}

	if (isLoading) {
		return <GridLoader />;
	}

	// Normalize type for MediaRow
	const normalizedType = searchParams.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';

	return (
		<div className="space-y-10">
			<MediaRow
				isVertical={true}
				showRank={false}
				text=""
				shows={data}
				type={normalizedType}
			/>
			<div ref={ref}>{inView && isLoadingMore && <GridLoader />}</div>
		</div>
	);
}

export default LoadMore;
