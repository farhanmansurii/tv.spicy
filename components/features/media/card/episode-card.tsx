'use client';

import React from 'react';
import { Episode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import { Play, Lock, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EpisodeCardProps {
	episode: Episode;
	active: boolean;
	toggle: (episode: Episode, event: React.MouseEvent<HTMLDivElement>) => void;
	view: 'grid' | 'list' | 'carousel';
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, active, toggle, view }) => {
	const isReleased = new Date(episode.air_date) <= new Date();
	const isGrid = view === 'grid' || view === 'carousel';

	return (
		<div
			onClick={(e) => toggle(episode, e)}
			className={cn(
				'group relative flex cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/50',
				active && 'border-primary/50 ring-1 ring-primary/50 bg-white/10',
				isGrid ? 'flex-col h-full' : 'flex-row h-32 md:h-40 items-center gap-4 pr-4',
				!isReleased && 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
			)}
		>
			<div
				className={cn(
					'relative shrink-0 overflow-hidden bg-black/40',
					isGrid ? 'aspect-video w-full' : 'h-full w-40 md:w-64'
				)}
			>
				{episode.still_path ? (
					<img
						src={tmdbImage(episode.still_path, 'w500')}
						alt={episode.name}
						className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
					/>
				) : (
					<div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/5 p-4 text-center">
						{isReleased ? (
							<span className="text-xs font-medium text-white/40">No Preview</span>
						) : (
							<>
								<Lock className="h-6 w-6 text-white/20" />
								<span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
									Locked
								</span>
							</>
						)}
					</div>
				)}

				<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
					{isReleased ? (
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform duration-300 hover:scale-110">
							<Play className="ml-1 h-5 w-5 fill-current" />
						</div>
					) : (
						<div className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
							Coming Soon
						</div>
					)}
				</div>

				{episode.runtime > 0 && (
					<div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
						{episode.runtime}m
					</div>
				)}

				{active && (
					<div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
				)}
			</div>

			<div className={cn('flex flex-col min-w-0 flex-1', isGrid ? 'p-4' : 'py-2')}>
				<div className="flex items-center justify-between mb-1.5">
					<span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary/90">
						Episode {episode.episode_number}
					</span>
					<span className="text-[10px] text-white/40 font-medium tabular-nums">
						{episode.air_date ? format(new Date(episode.air_date), 'MMM d') : 'TBA'}
					</span>
				</div>
				<h3
					className={cn(
						'font-bold text-white leading-tight truncate transition-colors group-hover:text-primary',
						isGrid ? 'text-base mb-2' : 'text-lg mb-1'
					)}
				>
					{episode.name}
				</h3>
				<p
					className={cn(
						'text-white/50 text-xs md:text-sm leading-relaxed line-clamp-2',
						isGrid ? 'mb-3' : 'line-clamp-2'
					)}
				>
					{episode.overview || 'No description available.'}
				</p>
				<div className="mt-auto flex items-center gap-3 text-xs text-white/30">
					{!isReleased && (
						<span className="flex items-center gap-1.5 text-white/40">
							<Clock className="h-3 w-3" />
							<span>Available {episode.air_date}</span>
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
