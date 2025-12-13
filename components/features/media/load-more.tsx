'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { fetchGenreById } from '@/lib/utils';
import { Show } from '@/lib/types';
import MediaRow from './row/media-row';
import GridLoader from '@/components/shared/loaders/grid-loader';

let page = 1;

function LoadMore(props: { params: any }) {
	const { params } = props;
	const { ref, inView } = useInView();

	const [data, setData] = useState<Show[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchParams, setSearchParams] = useState<any>(null);

	// Handle async params
	useEffect(() => {
		const loadParams = async () => {
			const resolvedParams = await params;
			setSearchParams(resolvedParams?.searchParams || {});
		};
		loadParams();
	}, [params]);

	useEffect(() => {
		if (inView && searchParams?.type && searchParams?.id) {
			setIsLoading(true);
			const delay = 500;

			const timeoutId = setTimeout(
				async () => {
					try {
						const res = await fetchGenreById(searchParams.type, searchParams.id, page);
						setData((prev) => [...prev, ...res]);
						page++;
					} catch (error) {
						console.error('Error loading more:', error);
					} finally {
						setIsLoading(false);
					}
				},
				page === 1 ? 0 : delay
			);

			return () => clearTimeout(timeoutId);
		}
	}, [inView, searchParams]);

	// Reset page when params change
	useEffect(() => {
		page = 1;
		setData([]);
	}, [searchParams?.id, searchParams?.type]);

	if (!searchParams?.type || !searchParams?.id) {
		return <GridLoader />;
	}

	return (
		<div className="space-y-10">
			<MediaRow
				isVertical={true}
				showRank={false}
				text=""
				shows={data}
				type={searchParams.type}
			/>
			<div ref={ref}>{inView && isLoading && <GridLoader />}</div>
		</div>
	);
}

export default LoadMore;
