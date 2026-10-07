'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { fetchGenreByIdFromApi, fetchRowDataFromApi } from '@/lib/api/tmdb-row-client';
import MediaRow from './media-row';
import { Button } from '@/components/ui/button';
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
	rowNumber?: number;
}

function RowStatePanel({
	state,
	text,
	hideHeader,
	rowNumber,
	onRetry,
}: {
	state: 'error' | 'empty';
	text: string;
	hideHeader: boolean;
	rowNumber?: number;
	onRetry: () => void;
}) {
	const isError = state === 'error';
	return (
		<section className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 section-spacing overflow-visible">
			<div className="px-gutter">
				{!hideHeader && text && (
					<div className="mb-5 flex items-baseline gap-3 md:mb-6">
						{rowNumber !== undefined && (
							<span
								aria-hidden="true"
								className="pb-1.25 font-mono text-caption leading-none tracking-label text-brand tabular-nums"
							>
								{String(rowNumber).padStart(2, '0')}
							</span>
						)}
						<h2 className="text-title text-text">{text}</h2>
					</div>
				)}
				<div
					role={isError ? 'alert' : 'status'}
					aria-live={isError ? 'assertive' : 'polite'}
					className="flex min-h-56 flex-col items-start justify-center gap-3 rounded-sm border border-border bg-card/40 px-5 py-8 sm:px-6"
				>
					<p className="flex items-center gap-2 font-mono text-caption uppercase tracking-label text-destructive">
						{isError && <WarningCircleIcon size={16} weight="fill" aria-hidden="true" />}
						{isError ? 'Signal lost' : 'Nothing scheduled'}
					</p>
					<p className="text-title text-text">
						{isError ? 'The projector jammed.' : 'This reel is empty.'}
					</p>
					<p className="max-w-sm text-small leading-relaxed text-muted-foreground">
						{isError
							? 'We couldn’t reach the catalog. Check your connection and try again.'
							: 'The catalog has no titles in this row right now. Check back later.'}
					</p>
					<Button type="button" variant="ghost" onClick={onRetry} className="mt-1">
						{isError ? 'Try again' : 'Refresh'}
					</Button>
				</div>
			</div>
		</section>
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
	rowNumber,
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
				className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing overflow-visible"
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
					rowNumber={rowNumber}
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
					rowNumber={rowNumber}
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
				rowNumber={rowNumber}
			/>
		</div>
	);
}
