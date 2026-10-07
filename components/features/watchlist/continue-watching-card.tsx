'use client';

import React, { memo, useState } from 'react';
import Link from 'next/link';
import { ArrowCounterClockwiseIcon, XIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { ContinueWatchingItem } from '@/lib/continue-watching';
import { MediaFallback } from '@/components/ui/media-fallback';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';
import useTVShowStore from '@/store/recentsStore';

interface ContinueWatchingCardProps {
	item: ContinueWatchingItem;
	index: number;
}

const actionButton =
	'hit-target-lg flex size-8 items-center justify-center text-foreground/80 transition-colors duration-(--duration-ui) can-hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function ContinueWatchingCardComponent({ item, index }: ContinueWatchingCardProps) {
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const { deleteRecentlyWatched, updateTimeWatched } = useTVShowStore();
	const imagePath = item.stillPath;
	const title = item.showName || item.title || 'Untitled';
	const href =
		item.mediaType === 'movie'
			? `/movie/${item.mediaId}`
			: `/tv/${item.mediaId}?season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}`;
	const episodeCode =
		item.mediaType !== 'movie' && item.seasonNumber && item.episodeNumber
			? `S${item.seasonNumber} · E${item.episodeNumber}`
			: null;
	const progress = Math.min(Math.max(item.progressPercent ?? 0, 0), 100);
	const hasImage = Boolean(imagePath) && !imageError;

	const handleRemove = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const snapshot: ContinueWatchingItem[] = [{ ...item }];
		const ok = await deleteRecentlyWatched(item.mediaId, item.mediaType);
		if (!ok) return;

		toast('Removed from history', {
			description: title,
			duration: 8000,
			action: {
				label: 'Undo',
				onClick: () => {
					void useTVShowStore.getState().restoreRecentlyWatched(snapshot);
				},
			},
		});
	};

	const handleRestart = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		updateTimeWatched(String(item.mediaId), 0, item.mediaType);
	};

	return (
		<div className="group/card relative">
			<Link
				href={href}
				prefetch={false}
				aria-label={episodeCode ? `Continue ${title}, ${episodeCode}` : `Continue ${title}`}
				className="block rounded-sm outline-none transition-transform duration-(--duration-press) ease-out active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100"
			>
				<span className="relative isolate block aspect-video w-full overflow-hidden rounded-sm bg-gradient-card-placeholder">
					{hasImage && (
						<img
							src={tmdbImage(imagePath!, 'w780')}
							alt=""
							onLoad={() => setImageLoaded(true)}
							onError={() => setImageError(true)}
							loading={index < 4 ? 'eager' : 'lazy'}
							decoding="async"
							className={cn(
								'absolute inset-0 size-full object-cover transform-gpu transition-[transform,scale,opacity] duration-(--duration-image) ease-entrance motion-safe:group-can-hover/card:scale-104 motion-reduce:transition-none',
								imageLoaded ? 'opacity-100' : 'opacity-0'
							)}
						/>
					)}
					{!hasImage && (
						<MediaFallback variant="still" label={title} className="absolute inset-0" />
					)}

					<span
						aria-hidden="true"
						className="absolute inset-0 z-10 bg-linear-to-t from-background/80 via-background/20 via-55% to-transparent to-75%"
					/>

					<span aria-hidden="true" className="absolute inset-x-3.5 bottom-4 z-20 grid gap-1">
						<span className="line-clamp-2 text-ui font-medium">{title}</span>
						<span className="flex min-w-0 items-center gap-x-2 font-mono text-micro uppercase leading-tight tracking-meta text-muted-foreground">
							{episodeCode && <span className="shrink-0 tabular-nums text-foreground">{episodeCode}</span>}
							{item.episodeName && <span className="truncate">{item.episodeName}</span>}
							{!episodeCode && progress > 0 && (
								<span className="tabular-nums">{Math.round(progress)}% watched</span>
							)}
						</span>
					</span>

					{progress > 0 && (
						<span aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-1 bg-foreground/20">
							<span
								className="block h-full w-full origin-left scale-x-(--progress-ratio) bg-brand"
								style={{ '--progress-ratio': progress / 100 } as React.CSSProperties}
							/>
						</span>
					)}

					<span aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 rounded-sm shadow-inset-line" />
					<span
						aria-hidden="true"
						className="absolute inset-0 z-30 rounded-sm border-2 border-brand opacity-0 transition-opacity duration-(--duration-ui) ease-out group-focus-within/card:opacity-100 group-can-hover/card:opacity-100"
					/>
				</span>
			</Link>

			<div className="absolute top-2 right-2 z-40 flex items-center divide-x divide-line rounded-full bg-background/72 backdrop-blur-md transition-opacity duration-(--duration-ui) pointer-fine:opacity-0 pointer-fine:group-can-hover/card:opacity-100 pointer-fine:focus-within:opacity-100">
				<button type="button" onClick={handleRestart} aria-label={`Start ${title} over`} title="Start over" className={cn(actionButton, 'rounded-l-full pl-0.5')}>
					<ArrowCounterClockwiseIcon size={14} aria-hidden="true" />
				</button>
				<button type="button" onClick={handleRemove} aria-label={`Remove ${title} from history`} title="Remove" className={cn(actionButton, 'rounded-r-full pr-0.5 can-hover:text-destructive')}>
					<XIcon size={14} aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}

export const ContinueWatchingCard = memo(ContinueWatchingCardComponent);
ContinueWatchingCard.displayName = 'ContinueWatchingCard';
