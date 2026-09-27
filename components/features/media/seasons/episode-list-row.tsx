'use client';

import React, { memo, useState } from 'react';
import { PlayIcon } from '@phosphor-icons/react';
import { MediaFallback } from '@/components/ui/media-fallback';
import { useHaptics } from '@/hooks/use-haptics';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';
import type { Episode } from '@/lib/types';

export interface EpisodeListRowProps {
	episode: Episode;
	active?: boolean;
	onClick: (episode: Episode, event?: React.MouseEvent) => void;
	index?: number;
	progressPercent?: number | null;
	className?: string;
}

function EpisodeListRowComponent({
	episode,
	active = false,
	onClick,
	progressPercent,
	className,
}: EpisodeListRowProps) {
	const haptic = useHaptics();
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);

	const epNum = String(episode.episode_number).padStart(2, '0');
	const seasonNum = String(episode.season_number).padStart(2, '0');
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w500') : null;

	const progress = Math.max(0, Math.min(100, progressPercent ?? 0));
	const hasProgress = progress >= 3;

	const airDateString = episode.air_date
		? new Date(episode.air_date)
				.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				})
				.toUpperCase()
		: null;

	const isGenericTitle =
		!episode.name || /^Episode\s+\d+$/i.test(episode.name.trim());

	const metaParts = [
		`S${seasonNum} E${epNum}`,
		episode.runtime ? `${episode.runtime}M` : null,
		airDateString,
	].filter(Boolean);

	const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
		haptic('light');
		onClick(episode, e as unknown as React.MouseEvent);
	};

	return (
		<li
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick(e);
				}
			}}
			aria-current={active ? 'true' : undefined}
			className={cn(
				'group relative flex w-full items-start md:items-center gap-3 md:gap-8 py-5 border-b border-line cursor-pointer transition-colors duration-150',
				'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2',
				active && 'border-brand bg-secondary/30',
				hasProgress && !active && 'border-line-strong',
				className
			)}
		>
			{/* Episode number */}
			<span className="w-8 md:w-16 shrink-0 self-start font-display text-display-3 text-dim tabular-nums select-none">
				{epNum}
			</span>

			{/* Content container: stacked on mobile, inline on desktop */}
			<div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 lg:gap-8">
				{/* 16:9 still */}
				<div className="relative aspect-video w-full md:w-52 lg:w-60 shrink-0 overflow-hidden rounded-sm bg-surface shadow-inset-line">
					{stillUrl && !imageError ? (
						<>
							{!imageLoaded && (
								<MediaFallback
									variant="still"
									episodeNumber={epNum}
									className="absolute inset-0"
								/>
							)}
							<img
								src={stillUrl}
								alt=""
								loading="lazy"
								decoding="async"
								onLoad={() => setImageLoaded(true)}
								onError={() => setImageError(true)}
								className={cn(
									'h-full w-full object-cover transition-[transform,opacity] duration-250',
									imageLoaded
										? 'opacity-75 can-hover:hover:opacity-100 can-hover:hover:scale-105'
										: 'opacity-0'
								)}
							/>
						</>
					) : (
						<MediaFallback
							variant="still"
							episodeNumber={epNum}
							className="absolute inset-0"
						/>
					)}

					{/* 1px hairline overlay */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 shadow-inset-line rounded-sm"
					/>

					{/* Subtle progress bar */}
					{hasProgress && (
						<div
							aria-hidden="true"
							className="absolute inset-x-0 bottom-0 h-1 bg-black/60 overflow-hidden"
						>
							<div
								ref={(el) => {
									if (el) el.style.transform = `scaleX(${progress / 100})`;
								}}
								className="h-full bg-brand origin-left transition-transform duration-200"
							/>
						</div>
					)}
				</div>

				{/* Copy block */}
				<div className="flex-1 min-w-0 flex flex-col gap-1.5">
					{!isGenericTitle && (
						<h3 className="line-clamp-2 text-title font-semibold text-text m-0">
							{episode.name}
						</h3>
					)}

					<span className="text-micro font-mono uppercase text-dim tracking-meta tabular-nums">
						{metaParts.join(' · ')}
					</span>

					{episode.overview ? (
						<p className="line-clamp-2 text-small text-dim max-w-xl m-0">
							{episode.overview}
						</p>
					) : null}
				</div>

				{/* Play button */}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						handleClick(e);
					}}
					className={cn(
						'dv-episode-play pressable shrink-0 self-start md:self-center inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2',
						'text-ui font-semibold text-text can-hover:hover:border-brand can-hover:hover:text-brand',
						'transition-[border-color,color,opacity] duration-150',
						'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
					)}
				>
					<PlayIcon
						size={14}
						weight="fill"
						className="translate-x-px"
						aria-hidden="true"
					/>
					<span>Play episode</span>
				</button>
			</div>
		</li>
	);
}

export const EpisodeListRow = memo(EpisodeListRowComponent);
