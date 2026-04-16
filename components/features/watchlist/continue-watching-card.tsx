'use client';

import React, { memo, useMemo, useState } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, X } from 'lucide-react';
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

	return (
		<Link
			href={href}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseLeave={() => setIsPressed(false)}
			className={cn(
				'group relative flex items-center gap-3 rounded-2xl p-2',
				'bg-white/[0.03] hover:bg-white/[0.06]',
				'ring-1 ring-white/[0.06] hover:ring-white/[0.12]',
				'transition-[background-color,box-shadow,transform] duration-200 ease-out',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
				isPressed && 'scale-[0.985]'
			)}
		>
			{/* Thumbnail */}
			<div className="relative flex-shrink-0 w-36 sm:w-40 aspect-video rounded-xl overflow-hidden bg-zinc-900">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={item.showName || item.title || ''}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
						loading={index < 4 ? 'eager' : 'lazy'}
						decoding="async"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
				)}

				{/* Scrim + play button */}
				<div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-200">
						<Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
					</div>
				</div>

				{/* Progress bar — sits at the bottom of the thumbnail */}
				{progress > 0 && (
					<div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15">
						<div
							className="h-full bg-white rounded-full"
							style={{ width: `${Math.min(progress, 100)}%` }}
						/>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0 py-1 pr-1">
				<h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate leading-snug">
					{item.showName || item.title}
				</h3>
				{episodeLine && (
					<p className="text-xs font-medium text-zinc-500 mt-0.5">{episodeLine}</p>
				)}
				{item.episodeName && (
					<p className="text-xs text-zinc-500 mt-0.5 truncate line-clamp-1 leading-snug">
						{item.episodeName}
					</p>
				)}
				{progress > 0 && (
					<p className="text-[11px] text-zinc-600 mt-1.5 tabular-nums">
						{progress}% watched
					</p>
				)}
			</div>

			{/* Action buttons — appear on hover */}
			<div className="flex-shrink-0 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-1">
				<button
					onClick={handleRestart}
					className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] ring-1 ring-white/10 text-zinc-400 hover:text-white transition-colors"
					aria-label="Start over"
					title="Start over"
				>
					<RotateCcw className="w-3 h-3" />
				</button>
				<button
					onClick={handleRemove}
					className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.08] hover:bg-red-500/20 ring-1 ring-white/10 text-zinc-400 hover:text-red-400 transition-colors"
					aria-label="Remove"
					title="Remove"
				>
					<X className="w-3 h-3" />
				</button>
			</div>
		</Link>
	);
}

export const ContinueWatchingCard = memo(ContinueWatchingCardComponent);
ContinueWatchingCard.displayName = 'ContinueWatchingCard';
