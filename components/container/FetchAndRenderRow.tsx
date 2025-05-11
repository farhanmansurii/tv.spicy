'use client';

import { fetchGenreById, fetchRowData } from '@/lib/utils';
import Row from './Row';
import RowLoader from '../loading/RowLoader';
import GridLoader from '../loading/GridLoader';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';

interface FetchAndRenderRowProps {
	apiEndpoint?: any;
	text: string;
	showRank: boolean;
	type: string;
	isVertical?: boolean;
	isGenre?: boolean;
}

const FetchAndRenderRow: React.FC<FetchAndRenderRowProps> = ({
	apiEndpoint,
	text,
	showRank,
	type,
	isGenre = false,
	isVertical = false,
}) => {
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

	const queryKey = ['movies', apiEndpoint];

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey,
		queryFn: async () =>
			isGenre
				? fetchGenreById(apiEndpoint.type, apiEndpoint.id, 1)
				: fetchRowData(apiEndpoint),
		enabled: inView && !!apiEndpoint,
		staleTime: 1000 * 60 * 60 * 24, // 24h
		gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	if (isLoading || isFetching) {
		return isVertical ? <GridLoader /> : <RowLoader withHeader />;
	}

	if (error) {
		console.error('Error fetching data:', error);
		return <div>Error loading content.</div>;
	}

	return (
		<div ref={ref}>
			{Array.isArray(data) && data.length > 0 ? (
				<Row
					isVertical={isVertical}
					text={text}
					shows={showRank ? data.slice(0, 10) : data}
					type={type}
					showRank={showRank}
				/>
			) : isVertical ? (
				<GridLoader />
			) : (
				<RowLoader withHeader />
			)}
		</div>
	);
};

export default FetchAndRenderRow;
