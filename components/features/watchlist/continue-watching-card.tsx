'use client';

import React, { memo, useMemo, useState } from 'react';
import Link from 'next/link';
import { PlayIcon, ArrowCounterClockwiseIcon, XIcon } from '@phosphor-icons/react';
import type { ContinueWatchingItem } from '@/lib/continue-watching';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';
import useTVShowStore from '@/store/recentsStore';

interface ContinueWatchingCardProps {
	item: ContinueWatchingItem;
	index: number;
}

function ContinueWatchingCardComponent({ item, index }: ContinueWatchingCardProps) {
	const [isPressed, setIsPressed] = useState(false);
	const [imageError, setImageError] = useState(false);
	const { deleteRecentlyWatched, updateTimeWatched } = useTVShowStore();
	const imageUrl = item.stillPath ? tmdbImage(item.stillPath, 'w300') : null;
	const href =
		item.mediaType === 'movie'
			? `/movie/${item.mediaId}`
			: `/tv/${item.mediaId}?season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}`;

	const episodeLine = useMemo(() => {
		if (item.mediaType === 'movie') return null;
		if (item.seasonNumber && item.episodeNumber) {
			return `S${item.seasonNumber} · E${item.episodeNumber}`;
		}
		return null;
	}, [item]);

	const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		deleteRecentlyWatched(item.mediaId, item.mediaType);
	};

	const handleRestart = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		updateTimeWatched(String(item.mediaId), 0, item.mediaType);
	};

	const progress = Math.max(item.progressPercent ?? 0, 0);

	// Action button: solid subtle surface, not glassmorphism
	const actionBtn = (
		intent: 'neutral' | 'danger',
		aria: string,
		icon: React.ReactNode,
		onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
	) => (
		<button
			onClick={onClick}
			className={cn(
				// Touch target: min 36px (within a small card, 44px is too bulky)
				'flex items-center justify-center w-9 h-9 rounded-full',
				// Surface
				intent === 'neutral'
					? 'bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.16]'
					: 'bg-white/[0.06] hover:bg-red-500/15 active:bg-red-500/25',
				// Text
				intent === 'neutral'
					? 'text-white/50 hover:text-white'
					: 'text-white/50 hover:text-red-400',
				// Border for definition
				'border border-white/[0.08] hover:border-white/[0.14]',
				// Focus ring: design system token
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				// Transitions
				'transition-all duration-150 ease-out'
			)}
			aria-label={aria}
			title={aria}
			type="button"
		>
			{icon}
		</button>
	);

	return (
		<div className="group/card relative">
			{/* Main card link */}
			<Link
				href={href}
				onMouseDown={() => setIsPressed(true)}
				onMouseUp={() => setIsPressed(false)}
				onMouseLeave={() => setIsPressed(false)}
				className={cn(
					'flex items-center gap-3 rounded-xl md:rounded-2xl p-2 md:p-2.5',
					'bg-white/[0.03] hover:bg-white/[0.06]',
					'ring-1 ring-white/[0.06] hover:ring-white/[0.12]',
					'transition-[background-color,box-shadow,transform] duration-200 ease-out',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
					isPressed && 'scale-[0.985]'
				)}
			>
				{/* Thumbnail */}
				<div className="relative flex-shrink-0 w-32 sm:w-36 md:w-40 aspect-video rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950">
					{imageUrl && !imageError ? (
						<img
							src={imageUrl}
							alt={item.showName || item.title || ''}
							className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
							loading={index < 4 ? 'eager' : 'lazy'}
							decoding="async"
							onError={() => setImageError(true)}
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
							<span className="text-xs font-semibold text-white/60 text-center px-2 line-clamp-2">
								{item.showName || item.title || 'Untitled'}
							</span>
						</div>
					)}

					{/* Scrim + play button */}
					<div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
						<div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg scale-90 group-hover/card:scale-100 transition-transform duration-200">
							<PlayIcon size={14} weight="fill" className="text-black ml-0.5" />
						</div>
					</div>

					{/* Progress bar */}
					{progress > 0 && (
						<div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
							<div
								className="h-full bg-[#0A84FF] rounded-full"
								style={{ width: `${Math.min(progress, 100)}%` }}
							/>
						</div>
					)}
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0 py-0.5 pr-10">
					<h3 className="text-sm font-semibold text-foreground group-hover/card:text-white transition-colors truncate leading-snug">
						{item.showName || item.title}
					</h3>
					{episodeLine && (
						<p className="text-xs font-medium text-muted-foreground mt-0.5">
							{episodeLine}
						</p>
					)}
					{item.episodeName && (
						<p className="text-xs text-muted-foreground/80 mt-0.5 truncate line-clamp-1 leading-snug">
							{item.episodeName}
						</p>
					)}
					{progress > 0 && (
						<p className="text-[11px] text-muted-foreground/60 mt-1.5 tabular-nums">
							{progress}% watched
						</p>
					)}
				</div>
			</Link>

			{/* Action buttons — outside the <Link> for valid HTML + a11y */}
			<div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
				{actionBtn(
					'neutral',
					'Start over',
					<ArrowCounterClockwiseIcon size={14} />,
					handleRestart
				)}
				{actionBtn(
					'danger',
					'Remove',
					<XIcon size={14} />,
					handleRemove
				)}
			</div>
		</div>
	);
}

export const ContinueWatchingCard = memo(ContinueWatchingCardComponent);
ContinueWatchingCard.displayName = 'ContinueWatchingCard';
