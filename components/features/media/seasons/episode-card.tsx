'use client';

import { memo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { PlayIcon, LockSimpleIcon, StarIcon } from '@phosphor-icons/react';
import { MediaFallback } from '@/components/ui/media-fallback';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import { isReducedMotion, reveal, staggerAt } from '@/lib/motion';
import type { Episode } from '@/lib/types';
import { useHaptics } from '@/hooks/use-haptics';

interface EpisodeCardProps {
	episode: Episode;
	active?: boolean;
	onClick: (episode: Episode, event?: React.MouseEvent) => void;
	index?: number;
}

function EpisodeCardComponent({ episode, active = false, onClick, index = 0 }: EpisodeCardProps) {
	const haptic = useHaptics();
	const cardRef = useRef<HTMLButtonElement>(null);
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w780') : null;
	const [stillLoaded, setStillLoaded] = useState(false);
	const [stillError, setStillError] = useState(false);
	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const epNum = String(episode.episode_number).padStart(2, '0');

	const hasRating = typeof episode.vote_average === 'number' && episode.vote_average > 0;
	const hasRuntime = episode.runtime != null && episode.runtime > 0;

	useGSAP(
		() => {
			reveal(cardRef.current, {
				delay: isReducedMotion() ? 0 : staggerAt(index, 0.045),
			});
		},
		{ scope: cardRef, dependencies: [index] }
	);

	const handleClick = (e: React.MouseEvent) => {
		if (!isReleased) return;
		haptic('light');
		onClick(episode, e);
	};

	return (
		<button
			ref={cardRef}
			type="button"
			onClick={handleClick}
			disabled={!isReleased}
			className={cn(
				'group relative h-full w-full overflow-hidden rounded-sm border text-left transition-[border-color,background-color,transform] duration-(--duration-ui) ease-out active:scale-97 motion-reduce:active:scale-100',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				active ? 'border-brand bg-card' : 'border-border bg-card can-hover:border-border-strong',
				!isReleased && 'opacity-40 cursor-not-allowed'
			)}
		>
			{/* Artwork */}
			<div className="relative aspect-video w-full overflow-hidden bg-muted">
				<div className="absolute inset-0 transition-transform duration-(--duration-image) ease-out group-can-hover:scale-104 motion-reduce:transition-none">
					{stillUrl && !stillError ? (
						<>
							{!stillLoaded && (
								<MediaFallback
									variant="still"
									episodeNumber={epNum}
									className="absolute inset-0"
								/>
							)}
							<img
								src={stillUrl}
								alt={`Episode ${episode.episode_number}${episode.name ? `: ${episode.name}` : ''} still`}
								loading="lazy"
								decoding="async"
								onLoad={() => setStillLoaded(true)}
								onError={() => setStillError(true)}
								className={cn(
									'h-full w-full object-cover transition-opacity duration-(--duration-fade)',
									stillLoaded ? 'opacity-100' : 'opacity-0'
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
				</div>

				{/* Gradient */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

				{/* Active glow */}
				{active && (
					<div
						className="absolute inset-0 pointer-events-none bg-ring/10"
					/>
				)}

				{/* Play button - CSS hover and focus only, fine pointers only */}
				<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
					<div
						className={cn(
							'flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg',
							'transition-[opacity,transform] duration-(--duration-ui) ease-out motion-reduce:transition-none',
							active
								? 'opacity-100'
								: 'scale-95 translate-y-1 opacity-0 group-can-hover:translate-y-0 group-can-hover:scale-100 group-can-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100'
						)}
					>
						<PlayIcon weight="fill" size={14} className="text-background ml-0.5" />
					</div>
				</div>

				{active && (
					<span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-brand px-2 py-1 font-mono text-xs uppercase tracking-meta text-brand-foreground">
						Playing
					</span>
				)}

				{!isReleased && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
						<LockSimpleIcon size={16} className="text-white/50" weight="bold" />
					</div>
				)}

				{/* Subtle inner highlight */}
				<div className="absolute inset-0 shadow-inset-line pointer-events-none" />
			</div>

			{/* Info */}
			<div
				className={cn(
					'flex flex-col gap-1 px-3 py-3',
					active ? 'bg-secondary' : 'bg-card'
				)}
			>
				{/* Title */}
				<h3
					className={cn(
						'line-clamp-1 text-sm font-semibold leading-tight transition-colors duration-(--duration-ui)',
						active ? 'text-foreground' : 'text-muted-foreground group-can-hover:text-foreground'
					)}
				>
					{episode.name || `Episode ${episode.episode_number}`}
				</h3>

				{/* Metadata row */}
				<div className="flex items-center gap-1.5">
					<span
						className={cn(
							'font-mono text-xs font-medium uppercase tracking-meta tabular-nums transition-colors duration-(--duration-ui)',
							active ? 'text-brand' : 'text-muted-foreground group-can-hover:text-foreground'
						)}
					>
						E{epNum}
					</span>
					{hasRuntime && (
						<>
							<span className="text-white/50 text-xs" aria-hidden="true">&middot;</span>
							<span
								className="text-xs text-white/55 tabular-nums"
							>
								{episode.runtime}m
							</span>
						</>
					)}
					{hasRating && (
						<>
							<span className="text-white/50 text-xs" aria-hidden="true">&middot;</span>
							<span
								className="inline-flex items-center gap-0.5 text-xs font-bold tabular-nums"

							>
								<StarIcon weight="fill" size={7} />
								{(episode.vote_average ?? 0).toFixed(1)}
							</span>
						</>
					)}
				</div>
			</div>
		</button>
	);
}

export const EpisodeCard = memo(EpisodeCardComponent);
EpisodeCardComponent.displayName = 'EpisodeCard';
