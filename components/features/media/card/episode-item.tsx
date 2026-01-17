/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Play, ImageOff, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import type { Episode } from '@/lib/types';

export interface EpisodeItemProps {
	episode: Episode;
	active?: boolean;
	toggle: (episode: Episode, event?: React.MouseEvent) => void;
	variant?: 'card' | 'list';
	watched?: boolean;
	density?: 'comfortable' | 'compact';
}

export function EpisodeItem({
	episode,
	active = false,
	toggle,
	variant = 'card',
	watched,
	density = 'comfortable',
}: EpisodeItemProps) {
	if (!episode) return null;

	const isCompact = density === 'compact';
	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const stillUrl = episode.still_path
		? tmdbImage(episode.still_path, variant === 'card' ? 'original' : 'w500')
		: null;
	const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;
	const hasGoodRating = episode.vote_average ? episode.vote_average >= 8.0 : false;

	const [isClicked, setIsClicked] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		if (!isReleased) return;
		setIsClicked(true);
		setTimeout(() => setIsClicked(false), 150);
		toggle(episode, e);
	};

	if (variant === 'list') {
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

				<div
					className={cn(
						'flex-1 min-w-0 flex flex-col justify-center',
						isCompact ? 'gap-1' : 'gap-1.5'
					)}
				>
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
	}

	return (
		<div
			onClick={handleClick}
			className={cn(
				'group relative aspect-video w-full overflow-hidden select-none transition-all duration-500 ease-out',
				'rounded-2xl border bg-black shadow-sm',
				active
					? 'ring-[3px] ring-primary ring-offset-2 ring-offset-background scale-[0.97] shadow-xl'
					: 'border-white/5 hover:scale-[1.02] hover:shadow-2xl',
				!isReleased && 'opacity-60 cursor-not-allowed',
				isClicked && 'scale-[0.98]'
			)}
		>
			<div className="absolute inset-0 z-0">
				{stillUrl ? (
					<img
						src={stillUrl}
						alt=""
						className={cn(
							'h-full w-full object-cover transition-transform duration-[2000ms] ease-out',
							active ? 'scale-105' : 'scale-100 group-hover:scale-105'
						)}
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center bg-neutral-900">
						<ImageOff className="w-8 h-8 text-neutral-700" />
					</div>
				)}
			</div>

			<div
				className={cn(
					'absolute inset-0 z-10 transition-opacity duration-500 bg-gradient-to-t from-black/90 via-black/20 to-transparent',
					active ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
				)}
			/>

			<div className="absolute top-3 left-3 z-30 flex gap-2">
				{episode.runtime && (
					<div className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/90 uppercase tracking-tight">
						{episode.runtime} min
					</div>
				)}
			</div>

			<div className="relative z-20 h-full w-full flex flex-col justify-end p-4 md:p-5">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-bold text-primary tracking-widest uppercase">
							E{episode.episode_number}
						</span>
						{rating && (
							<div className="flex items-center gap-0.5 text-[10px] font-medium text-white/60">
								<Star className="w-2.5 h-2.5 fill-current text-yellow-500/80" />
								{rating}
							</div>
						)}
					</div>

					<h3 className="text-[14px] md:text-xl font-semibold text-white leading-tight tracking-tight">
						{episode.name || `Episode ${episode.episode_number}`}
					</h3>

					<div
						className={cn(
							'grid transition-all duration-500 ease-in-out',
							active || 'group-hover:grid-rows-[1fr] grid-rows-[0fr]'
						)}
					>
						<p
							style={{ lineHeight: '1.4' }}
							className={cn(
								'overflow-hidden text-[10px] md:text-sm text-white/60 leading-relaxed  line-clamp-2 font-normal',
								active
									? 'opacity-100 mt-1'
									: 'opacity-0 group-hover:opacity-100 group-hover:mt-1'
							)}
						>
							{episode.overview || 'No description available.'}
						</p>
					</div>
				</div>

				{!active && isReleased && (
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white">
							<Play className="w-5 h-5 fill-current ml-1" />
						</div>
					</div>
				)}

				{active && (
					<div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
						<div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
					</div>
				)}

				{!isReleased && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
						<Lock className="w-5 h-5 text-white/30" />
					</div>
				)}
			</div>
		</div>
	);
}
