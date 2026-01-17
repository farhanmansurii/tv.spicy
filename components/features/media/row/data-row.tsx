'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { fetchGenreById, fetchRowData } from '@/lib/api';
import MediaRow from './media-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import type { Show } from '@/lib/types';

export type DataRowEndpoint = string | { id: string | number; type: 'movie' | 'tv' };

export interface DataRowProps {
	endpoint?: DataRowEndpoint;
	text?: string;
	showRank?: boolean;
	type: 'movie' | 'tv';
	viewAllLink?: string;
	initialData?: unknown[];
	isVertical?: boolean;
	isGenre?: boolean;
	hideHeader?: boolean;
	gridLayout?: boolean;
	showError?: boolean;
}

export default function DataRow({
	endpoint,
	text = '',
	showRank = false,
	type,
	viewAllLink,
	initialData,
	isVertical,
	isGenre = false,
	hideHeader = false,
	gridLayout = false,
	showError = false,
}: DataRowProps) {
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const queryKey = ['data-row', endpoint, type, isGenre];
	const shouldFetch = hasMounted && inView && !!endpoint && !initialData;

	const { data, error, isLoading, isFetching } = useQuery({
		queryKey,
		queryFn: async () => {
			if (!endpoint) return [];
			if (isGenre && typeof endpoint !== 'string') {
				return fetchGenreById(endpoint.type, String(endpoint.id), 1);
			}
			return fetchRowData(
				typeof endpoint === 'string' ? endpoint : `${endpoint.type}/${endpoint.id}`
			);
		},
		enabled: shouldFetch,
		initialData: initialData,
		staleTime: 1000 * 60 * 60 * 24,
		gcTime: 1000 * 60 * 60 * 24 * 7,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const displayData = (initialData ?? data) as unknown[] | undefined;
	const mediaData = (displayData || []) as unknown as Show[];
	const hasData = Array.isArray(displayData) && displayData.length > 0;
	const shouldShowLoader = isLoading || isFetching || (!initialData && !hasMounted) || !hasData;

	if (shouldShowLoader) {
		return (
			<div ref={ref}>
				<MediaLoader
					withHeader={!hideHeader}
					layout={gridLayout ? 'grid' : 'carousel'}
					isVertical={isVertical}
				/>
			</div>
		);
	}

	if (error) {
		console.error('Error fetching data:', error);
		return showError ? <div>Error loading content.</div> : null;
	}

	if (!hasData) {
		return (
			<div ref={ref}>
				<MediaLoader
					withHeader={!hideHeader}
					layout={gridLayout ? 'grid' : 'carousel'}
					isVertical={isVertical}
				/>
			</div>
		);
	}

	return (
		<div ref={ref}>
			<MediaRow
				isVertical={isVertical}
				gridLayout={gridLayout}
				text={text}
				shows={showRank ? mediaData.slice(0, 10) : mediaData}
				type={type}
				hideHeader={hideHeader}
				viewAllLink={viewAllLink}
			/>
		</div>
	);
}
