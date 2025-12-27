'use client';

import { fetchGenreById, fetchRowData } from '@/lib/api';
import MediaRow from './media-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import GridLoader from '@/components/shared/loaders/grid-loader';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';

interface FetchAndRenderRowProps {
	apiEndpoint?: any;
	text?: string;
	showRank: boolean;
	type: string;
	isVertical?: boolean;
	isGenre?: boolean;
	hideHeader?: boolean;
	gridLayout?: boolean;
}

const FetchAndRenderRow: React.FC<FetchAndRenderRowProps> = ({
	apiEndpoint,
	text = '',
	showRank,
	type,
	isGenre = false,
	isVertical = undefined,
	hideHeader = false,
	gridLayout = false,
}) => {
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

	const queryKey = ['movies', apiEndpoint];

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey,
		queryFn: async () =>
			isGenre
				? fetchGenreById(apiEndpoint.type, apiEndpoint.id, 1)
				: fetchRowData(apiEndpoint),
		enabled: inView && !!apiEndpoint,
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24 * 7,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	if (isLoading || isFetching) {
		return <RowLoader withHeader isVertical={isVertical} gridLayout={gridLayout} />;
	}

	if (error) {
		console.error('Error fetching data:', error);
		return <div>Error loading content.</div>;
	}

	return (
		<div ref={ref}>
			{Array.isArray(data) && data.length > 0 ? (
				<MediaRow
					isVertical={isVertical}
					gridLayout={gridLayout}
					text={text}
					shows={showRank ? data.slice(0, 10) : data}
					type={type}
					hideHeader={hideHeader}
				/>
			) : (
				<RowLoader withHeader isVertical={isVertical} gridLayout={gridLayout} />
			)}
		</div>
	);
};

export default FetchAndRenderRow;
