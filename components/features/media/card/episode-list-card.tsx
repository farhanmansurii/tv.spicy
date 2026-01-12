/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Play, ImageOff, Lock, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';

export const EpisodeListRow = ({
	episode,
	active,
	toggle,
	watched,
	density = 'comfortable',
}: any) => {
	if (!episode) return null;

	const isCompact = density === 'compact';
	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w500') : null;
	const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;
	const hasGoodRating = episode.vote_average && episode.vote_average >= 8.0;

	const [isClicked, setIsClicked] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		if (!isReleased) return;

		// Immediate visual feedback
		setIsClicked(true);
		setTimeout(() => setIsClicked(false), 150);

		toggle(episode, e);
	};

	return (
		<div
			onClick={handleClick}
			className={cn(
				'group relative flex items-center transition-all duration-300 rounded-xl select-none',
				isCompact ? 'gap-3 md:gap-4 p-2.5 md:p-3' : 'gap-4 md:gap-6 p-3 md:p-4',
				active
					? 'bg-zinc-900/80 border border-white/20 shadow-xl shadow-black/50 backdrop-blur-sm'
					: 'hover:bg-zinc-900/40 cursor-pointer border border-white/5 hover:border-white/10',
				!isReleased && 'opacity-40 cursor-not-allowed',
				isClicked && 'scale-[0.98]'
			)}
		>
			{/* 1. THUMBNAIL: Improved Aspect Ratio */}
			<div
				className={cn(
					'relative flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-zinc-950 ring-1 ring-white/10 shadow-lg',
					isCompact ? 'w-28 md:w-36' : 'w-36 md:w-48'
				)}
			>
				{stillUrl ? (
					<img
						src={stillUrl}
						alt=""
						className={cn(
							'h-full w-full object-cover transition-transform duration-500 ease-out',
							active
								? 'scale-105 brightness-110'
								: 'group-hover:scale-105 group-hover:brightness-110'
						)}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-zinc-900">
						<ImageOff className="w-6 h-6 text-zinc-600" />
					</div>
				)}

				{/* Playing Indicator - Top Right Corner */}

				{/* Dynamic Overlay based on state */}
				{active ? (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center animate-in fade-in duration-300">
						<div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-2xl">
							<Play className="w-5 h-5 fill-black text-black ml-0.5" />
						</div>
					</div>
				) : (
					isReleased && (
						<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
							<div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center">
								<Play className="w-4 h-4 fill-white text-white ml-0.5" />
							</div>
						</div>
					)
				)}

				{!isReleased && (
					<div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center backdrop-blur-sm">
						<Lock className="w-5 h-5 text-white/50" />
					</div>
				)}
			</div>

			{/* 2. INFO SECTION: Improved Typography and Spacing */}
			<div
				className={cn(
					'flex-1 min-w-0 flex flex-col justify-center',
					isCompact ? 'gap-1' : 'gap-1.5'
				)}
			>
				{/* Metadata Row - Wraps on small screens */}
				<div
					className={cn(
						'flex items-center flex-wrap',
						isCompact ? 'gap-1.5 md:gap-2' : 'gap-2 md:gap-3'
					)}
				>
					<span
						className={cn(
							isCompact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
							'font-bold tracking-wider uppercase rounded-md whitespace-nowrap flex-shrink-0',
							active ? 'text-white bg-white/10' : 'text-zinc-400 bg-zinc-800/50'
						)}
					>
						EP {episode.episode_number}
					</span>
					{episode.runtime && (
						<span
							className={cn(
								isCompact ? 'text-[10px]' : 'text-xs',
								'font-medium text-zinc-500 tabular-nums whitespace-nowrap flex-shrink-0'
							)}
						>
							{episode.runtime} MIN
						</span>
					)}
					{rating && (
						<div
							className={cn(
								isCompact ? 'text-[10px]' : 'text-xs',
								'flex items-center gap-1 font-bold tabular-nums whitespace-nowrap flex-shrink-0',
								hasGoodRating ? 'text-yellow-500' : 'text-zinc-400'
							)}
						>
							<Star
								className={cn(
									isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3',
									'flex-shrink-0',
									hasGoodRating && 'fill-current'
								)}
							/>
							<span>{rating}</span>
						</div>
					)}
				</div>

				{/* Title - Truncates with ellipsis */}
				<h4
					className={cn(
						isCompact ? 'text-sm md:text-base' : 'text-base md:text-lg',
						'font-semibold leading-tight transition-colors min-w-0',
						active ? 'text-white font-bold' : 'text-zinc-200 group-hover:text-white'
					)}
				>
					<span
						className="block truncate"
						title={episode.name || `Episode ${episode.episode_number}`}
					>
						{episode.name || `Episode ${episode.episode_number}`}
					</span>
				</h4>

				{/* Description - Clamps to 2 lines */}
				<p
					className={cn(
						isCompact ? 'text-[11px] leading-snug' : 'text-sm leading-relaxed',
						'transition-colors min-w-0 line-clamp-2',
						active ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-400'
					)}
					title={episode.overview || 'No description available for this episode.'}
				>
					{episode.overview || 'No description available for this episode.'}
				</p>
			</div>
		</div>
	);
};
