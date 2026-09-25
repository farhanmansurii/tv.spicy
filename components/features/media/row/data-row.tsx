'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { fetchGenreByIdFromApi, fetchRowDataFromApi } from '@/lib/api/tmdb-row-client';
import MediaRow from './media-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { cn } from '@/lib/utils';
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
}

const stateActionButton = cn(
	'min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black',
	'transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100',
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
);

function RowStatePanel({
	state,
	text,
	hideHeader,
	onRetry,
}: {
	state: 'error' | 'empty';
	text: string;
	hideHeader: boolean;
	onRetry: () => void;
}) {
	const isError = state === 'error';
	return (
		<div className={cn(!hideHeader && 'py-3 md:py-5')}>
			{!hideHeader && (
				<div className="mb-3 flex items-center px-1 md:mb-4">
					<h2 className="text-lg font-bold tracking-[-0.02em] text-white md:text-xl">
						{text}
					</h2>
				</div>
			)}
			<div
				role={isError ? 'alert' : 'status'}
				aria-live={isError ? 'assertive' : 'polite'}
				className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl bg-white/[0.025] px-6 py-8 text-center ring-1 ring-inset ring-white/[0.06]"
			>
				{isError && (
					<WarningCircleIcon
						size={28}
						weight="fill"
						aria-hidden="true"
						className="text-[#FF453A]"
					/>
				)}
				<h3 className="text-base font-semibold text-white md:text-lg">
					{isError ? 'Couldn’t load this row' : 'Nothing to show here'}
				</h3>
				<p className="max-w-sm text-sm leading-relaxed text-white/70">
					{isError
						? 'We couldn’t reach the catalog. Check your connection and try again.'
						: 'This row is empty right now. Check back later.'}
				</p>
				<button type="button" onClick={onRetry} className={stateActionButton}>
					{isError ? 'Retry' : 'Refresh'}
				</button>
			</div>
		</div>
	);
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
}: DataRowProps) {
	const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const queryKey = ['data-row', endpoint, type, isGenre];
	const shouldFetch = hasMounted && inView && !!endpoint && !initialData;

	const { data, error, isLoading, isFetching, refetch } = useQuery({
		queryKey,
		queryFn: async () => {
			if (!endpoint) return [];
			if (isGenre && typeof endpoint !== 'string') {
				return fetchGenreByIdFromApi(endpoint.type, String(endpoint.id), 1);
			}
			return fetchRowDataFromApi(
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
	const hasResolvedQuery = displayData !== undefined;
	const hasData = Array.isArray(displayData) && displayData.length > 0;
	// MediaRow drops shows without images; a row whose items are all dropped
	// would render nothing, so treat it as empty instead of a blank gap.
	const hasRenderableData = mediaData.some((show) =>
		isVertical !== undefined
			? isVertical
				? !!show?.poster_path
				: !!show?.backdrop_path
			: !!show?.backdrop_path || !!show?.poster_path
	);
	const shouldShowLoader =
		isLoading ||
		isFetching ||
		(!initialData && !hasResolvedQuery) ||
		(!initialData && !hasMounted);

	const renderLoader = () => (
		<div ref={ref}>
			<MediaLoader
				withHeader={!hideHeader}
				layout={gridLayout ? 'grid' : 'carousel'}
				isVertical={isVertical}
				ranked={showRank}
			/>
		</div>
	);

	if (shouldShowLoader) {
		return renderLoader();
	}

	if (error) {
		console.error('Error fetching data:', error);
		return (
			<div ref={ref}>
				<RowStatePanel
					state="error"
					text={text}
					hideHeader={hideHeader}
					onRetry={() => refetch()}
				/>
			</div>
		);
	}

	if (!hasData || !hasRenderableData) {
		// If the query has finished and returned an empty array, don't keep showing the loader.
		if (!hasResolvedQuery) {
			return renderLoader();
		}

		return (
			<div ref={ref}>
				<RowStatePanel
					state="empty"
					text={text}
					hideHeader={hideHeader}
					onRetry={() => refetch()}
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
				ranked={showRank}
			/>
		</div>
	);
}
