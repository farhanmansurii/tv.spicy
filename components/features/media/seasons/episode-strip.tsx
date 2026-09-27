'use client';

import React, { memo, useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { cardCascade, isReducedMotion, skeletonResolve } from '@/lib/motion';
import { EpisodeListRow } from './episode-list-row';
import { cn } from '@/lib/utils';
import type { Episode } from '@/lib/types';

export type EpisodeViewMode = 'grid' | 'list';

export interface EpisodeStripProps {
	episodes: Episode[];
	activeEpisodeId?: number | string | null;
	onEpisodeClick: (episode: Episode, event?: React.MouseEvent) => void;
	isLoading?: boolean;
	viewMode?: EpisodeViewMode;
	progressEpisodeId?: number | null;
	progressPercent?: number | null;
	className?: string;
}

function EpisodeStripSkeleton() {
	return (
		<ul className="flex flex-col m-0 p-0 list-none w-full">
			{Array.from({ length: 6 }).map((_, i) => (
				<li
					key={i}
					className="flex w-full items-start md:items-center gap-3 md:gap-8 py-5 border-b border-line"
				>
					<div className="w-8 md:w-16 h-8 bg-surface rounded animate-pulse shrink-0" />
					<div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 lg:gap-8">
						<div className="aspect-video w-full md:w-52 lg:w-60 rounded-sm bg-surface animate-pulse shrink-0" />
						<div className="flex-1 min-w-0 flex flex-col gap-2">
							<div className="h-4 w-1/3 bg-surface rounded animate-pulse" />
							<div className="h-3 w-1/4 bg-surface rounded animate-pulse" />
							<div className="h-3 w-2/3 bg-surface rounded animate-pulse" />
						</div>
						<div className="h-9 w-28 rounded-full bg-surface animate-pulse shrink-0" />
					</div>
				</li>
			))}
		</ul>
	);
}

function EmptyEpisodes() {
	return (
		<div className="flex flex-col items-center justify-center gap-2 border-y border-line bg-band px-5 py-16 text-center">
			<p className="font-display text-4xl uppercase leading-none text-foreground m-0">
				No episodes on the reel.
			</p>
			<p className="font-mono text-caption uppercase tracking-label text-dim m-0">
				Try selecting another season above.
			</p>
		</div>
	);
}

function EpisodeStripComponent({
	episodes,
	activeEpisodeId,
	onEpisodeClick,
	isLoading = false,
	progressEpisodeId,
	progressPercent,
	className,
}: EpisodeStripProps) {
	const [showAll, setShowAll] = useState(false);
	const listRef = useRef<HTMLUListElement | null>(null);
	const listKey = `${episodes[0]?.id ?? 'empty'}-${episodes.length}`;

	const visibleEpisodes = showAll ? episodes : episodes.slice(0, 12);
	const hasMore = episodes.length > 12 && !showAll;

	// Reset showAll when episodes change (e.g. season switched)
	useEffect(() => {
		setShowAll(false);
	}, [episodes]);

	const hasResolvedRef = useRef(false);

	useGSAP(
		() => {
			if (hasResolvedRef.current || !listRef.current) return;
			hasResolvedRef.current = true;
			skeletonResolve(listRef.current);
		},
		{ dependencies: [listKey] }
	);

	const handleShowAll = () => {
		setShowAll(true);
		if (isReducedMotion()) return;
		requestAnimationFrame(() => {
			cardCascade(listRef.current?.querySelectorAll('li:nth-child(n+13)') ?? []);
		});
	};

	if (isLoading) return <EpisodeStripSkeleton />;
	if (!episodes.length) return <EmptyEpisodes />;

	return (
		<div className={cn('w-full flex flex-col', className)}>
			<ul
				key={listKey}
				ref={listRef}
				className="flex flex-col m-0 p-0 list-none w-full"
			>
				{visibleEpisodes.map((episode, index) => {
					const isActive =
						activeEpisodeId !== undefined &&
						activeEpisodeId !== null &&
						String(episode.id) === String(activeEpisodeId);

					const isProgressItem =
						progressEpisodeId !== undefined &&
						progressEpisodeId !== null &&
						episode.id === progressEpisodeId;

					return (
						<EpisodeListRow
							key={episode.id || `ep-${episode.season_number}-${episode.episode_number}`}
							episode={episode}
							index={index}
							active={isActive}
							progressPercent={isProgressItem ? progressPercent : undefined}
							onClick={onEpisodeClick}
						/>
					);
				})}
			</ul>

			{hasMore && (
				<div className="pt-4 flex justify-start">
					<button
						type="button"
						onClick={handleShowAll}
						className={cn(
							'pressable h-12 rounded-full border border-line-strong bg-band px-5',
							'text-body font-semibold text-text can-hover:border-brand can-hover:text-brand',
							'transition-[border-color,color,scale] duration-(--duration-ui)',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
						)}
					>
						Show all {episodes.length} episodes
					</button>
				</div>
			)}
		</div>
	);
}

export const EpisodeStrip = memo(EpisodeStripComponent);
