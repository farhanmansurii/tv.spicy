'use client';

import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PlayIcon, LockSimpleIcon, StarIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import type { Episode } from '@/lib/types';
import { useHaptics } from '@/hooks/use-haptics';

interface EpisodeListRowProps {
	episode: Episode;
	active?: boolean;
	onClick: (episode: Episode, event?: React.MouseEvent) => void;
	index?: number;
	progressPercent?: number | null;
}

function EpisodeListRowComponent({
	episode,
	active = false,
	onClick,
	index = 0,
	progressPercent,
}: EpisodeListRowProps) {
	const haptic = useHaptics();
	const reducedMotion = useReducedMotion();
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w300') : null;
	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const epNum = String(episode.episode_number).padStart(2, '0');
	const progress = Math.max(0, Math.min(100, progressPercent ?? 0));
	const isComplete = progress >= 95;
	const hasProgress = progress >= 3 && !isComplete;

	const airLabel = episode.air_date
		? new Date(episode.air_date).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: null;

	const handleClick = (e: React.MouseEvent) => {
		if (!isReleased) return;
		haptic('light');
		onClick(episode, e);
	};

	const itemTransition = useMemo(
		() => ({
			type: 'spring' as const,
			stiffness: 100,
			damping: 20,
		}),
		[]
	);

	return (
		<motion.button
			type="button"
			onClick={handleClick}
			disabled={!isReleased}
			initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				...itemTransition,
				delay: reducedMotion ? 0 : Math.min(index * 0.035, 0.35),
			}}
			whileTap={isReleased && !reducedMotion ? { scale: 0.99 } : undefined}
			aria-current={active ? 'true' : undefined}
			className={cn(
				'group relative w-full overflow-hidden rounded-xl text-left will-change-transform md:rounded-none',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				active
					? 'bg-[#0A84FF]/[0.08] ring-1 ring-inset ring-[#0A84FF]/30'
					: 'bg-white/[0.035] ring-1 ring-inset ring-white/[0.06] md:bg-transparent md:ring-0',
				!isReleased && 'cursor-not-allowed opacity-55'
			)}
		>
			{/* Active left bar */}
			<motion.div
				className="absolute bottom-0 left-0 top-0 w-[3px] rounded-full bg-[#0A84FF]"
				initial={false}
				animate={active ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 0.3 }}
			/>

			<div
				className={cn(
					'flex min-h-[76px] w-full items-center gap-3 px-2.5 py-2 transition-colors duration-150 md:min-h-[44px] md:gap-3.5 md:rounded-xl md:px-3 md:py-3',
					active ? 'md:bg-white/[0.08]' : 'md:hover:bg-white/[0.04]'
				)}
			>
				{/* Episode number */}
				<div
					className={cn(
						'hidden w-7 flex-shrink-0 select-none text-center text-sm font-bold leading-none tabular-nums transition-colors duration-300 md:block',
						active ? 'text-[#0A84FF]' : 'text-white/25 group-hover:text-white/40'
					)}
				>
					{epNum}
				</div>

				{/* Thumbnail */}
				<div
					className={cn(
						'relative aspect-video w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:w-32',
						active ? 'ring-1 ring-white/20' : 'ring-1 ring-white/[0.06]'
					)}
				>
					<motion.div
						className="absolute inset-0"
						whileHover={isReleased && !active ? { scale: 1.04 } : undefined}
						transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					>
						{stillUrl ? (
							<img
								src={stillUrl}
								alt={`Episode ${episode.episode_number}${episode.name ? `: ${episode.name}` : ''} thumbnail`}
								loading="lazy"
								className="h-full w-full object-cover"
								onError={(e) => {
									(e.currentTarget as HTMLImageElement).style.display = 'none';
								}}
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
						)}
					</motion.div>

					{/* Play overlay */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							initial={false}
							animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
							whileHover={
								isReleased && !active ? { opacity: 1, scale: 1 } : undefined
							}
							transition={{
								type: 'spring',
								stiffness: 260,
								damping: 22,
							}}
							className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md"
							style={{
								boxShadow: '0 3px 14px rgba(0,0,0,0.5)',
							}}
						>
							<PlayIcon weight="fill" size={11} className="text-black ml-px" />
						</motion.div>
					</div>

					{/* Waveform */}
					{active && (
						<div className="absolute bottom-1.5 right-1.5 flex items-end gap-[2px] h-2">
							{[55, 100, 40, 75].map((h, i) => (
								<motion.span
									key={i}
									className="w-[2px] rounded-full bg-[#0A84FF]"
									style={{ opacity: 0.85 }}
									animate={
										reducedMotion
											? { height: `${h}%` }
											: { height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`] }
									}
									transition={{
										duration: 0.8,
										ease: 'easeInOut',
										repeat: reducedMotion ? 0 : Infinity,
										delay: i * 0.15,
									}}
								/>
							))}
						</div>
					)}

					{!isReleased && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
							<LockSimpleIcon size={12} className="text-white/30" weight="bold" />
						</div>
					)}

					<div className="absolute left-1.5 top-1.5 flex items-center gap-1 md:hidden">
						<span className="rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-white backdrop-blur-md">
							E{episode.episode_number}
						</span>
						{active && (
							<span className="rounded bg-[#0A84FF] px-1.5 py-0.5 text-[9px] font-bold text-white">
								PLAYING
							</span>
						)}
						{isComplete && !active && (
							<span className="flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md">
								<CheckCircleIcon size={11} weight="fill" /> Watched
							</span>
						)}
					</div>

					{hasProgress && (
						<div className="absolute inset-x-0 bottom-0 h-1 bg-black/35">
							<div
								className="h-full rounded-r-full bg-[#0A84FF]"
								style={{ width: `${progress}%` }}
							/>
						</div>
					)}

					<div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] pointer-events-none" />
				</div>

				{/* Text content */}
				<div className="flex min-w-0 flex-1 flex-col justify-center gap-1 md:gap-0.5">
					{/* Title */}
					<h3
						className={cn(
							'line-clamp-1 text-sm font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 md:text-base',
							active ? 'text-white' : 'text-zinc-200 group-hover:text-white'
						)}
					>
						{episode.name || `Episode ${episode.episode_number}`}
					</h3>

					{/* Metadata row */}
					<div className="flex flex-wrap items-center gap-x-2 gap-y-0">
						{episode.runtime != null && episode.runtime > 0 && (
							<span className="text-[10px] sm:text-[11px] text-white/30 tabular-nums">
								{episode.runtime}m
							</span>
						)}
						{typeof episode.vote_average === 'number' && episode.vote_average > 0 && (
							<span
								className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold tabular-nums"
								style={{ color: '#FFD60A' }}
							>
								<StarIcon weight="fill" size={8} />
								{(episode.vote_average ?? 0).toFixed(1)}
							</span>
						)}
						{airLabel && (
							<span className="text-[10px] sm:text-[11px] text-white/20 tabular-nums">
								{airLabel}
							</span>
						)}
						{!isReleased && (
							<span className="text-[10px] font-medium text-white/15 uppercase tracking-wider">
								Upcoming
							</span>
						)}
					</div>

					{episode.overview && (
						<p className="line-clamp-1 text-[11px] leading-snug text-white/35 md:hidden">
							{episode.overview}
						</p>
					)}
				</div>
			</div>

			{/* Separator */}
			<div className="pointer-events-none absolute bottom-0 left-[2.75rem] right-0 hidden h-px bg-white/[0.05] md:block" />
		</motion.button>
	);
}

export const EpisodeListRow = memo(EpisodeListRowComponent);
EpisodeListRowComponent.displayName = 'EpisodeListRow';
