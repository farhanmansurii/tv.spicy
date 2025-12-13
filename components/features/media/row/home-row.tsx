'use client';

import { fetchRowData } from '@/lib/utils';
import MediaRow from './media-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';

interface HomeRowProps {
	endpoint: string;
	text: string;
	type: string;
	viewAllLink?: string;
	showRank?: boolean;
}

export function HomeRow({ endpoint, text, type, viewAllLink, showRank = false }: HomeRowProps) {
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

	const queryKey = ['homepage', endpoint, type];

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey,
		queryFn: async () => fetchRowData(endpoint),
		enabled: inView && !!endpoint,
		staleTime: 1000 * 60 * 60 * 24, // 24h
		gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	if (isLoading || isFetching) {
		return (
			<div ref={ref}>
				<RowLoader withHeader />
			</div>
		);
	}

	if (error) {
		console.error('Error fetching data:', error);
		return null; // Fail silently for homepage rows
	}

	return (
		<div ref={ref}>
			{Array.isArray(data) && data.length > 0 ? (
				<MediaRow
					text={text}
					shows={showRank ? data.slice(0, 10) : data}
					type={type}
					showRank={showRank}
					viewAllLink={viewAllLink}
				/>
			) : (
				<RowLoader withHeader />
			)}
		</div>
	);
}
