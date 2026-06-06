'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, LockSimpleIcon, StarIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import type { Episode } from '@/lib/types';
import { useHaptics } from '@/hooks/use-haptics';

interface EpisodeListRowProps {
	episode: Episode;
	active?: boolean;
	onClick: (episode: Episode, event?: React.MouseEvent) => void;
	index?: number;
}

function EpisodeListRowComponent({
	episode,
	active = false,
	onClick,
	index = 0,
}: EpisodeListRowProps) {
	const haptic = useHaptics();
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w300') : null;
	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const epNum = String(episode.episode_number).padStart(2, '0');

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
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				...itemTransition,
				delay: Math.min(index * 0.035, 0.35),
			}}
			whileTap={isReleased ? { scale: 0.99 } : undefined}
			className={cn(
				'group relative w-full text-left will-change-transform',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				!isReleased && 'opacity-40 cursor-not-allowed'
			)}
		>
			{/* Active left bar */}
			<motion.div
				className="absolute left-0 top-0 bottom-0 w-[2px] sm:w-[2.5px] rounded-full bg-[#0A84FF]"
				initial={false}
				animate={active ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 0.3 }}
			/>

			<div
				className={cn(
					'flex items-center gap-2.5 sm:gap-3 md:gap-3.5 w-full px-2.5 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 min-h-[44px]',
					active ? 'bg-white/[0.05]' : 'hover:bg-white/[0.025]'
				)}
			>
				{/* Episode number */}
				<div
					className={cn(
						'flex-shrink-0 w-6 sm:w-7 text-center tabular-nums font-bold leading-none select-none transition-colors duration-300',
						active ? 'text-[#0A84FF]' : 'text-white/25 group-hover:text-white/40'
					)}
					style={{
						fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)',
						fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
						letterSpacing: '-0.02em',
					}}
				>
					{epNum}
				</div>

				{/* Thumbnail */}
				<div
					className={cn(
						'relative flex-shrink-0 w-24 sm:w-28 md:w-32 aspect-video rounded-md sm:rounded-lg overflow-hidden bg-zinc-900',
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
									animate={{
										height: [`${h * 0.4}%`, `${h}%`, `${h * 0.4}%`],
									}}
									transition={{
										duration: 0.8,
										ease: 'easeInOut',
										repeat: Infinity,
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

					<div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] pointer-events-none" />
				</div>

				{/* Text content */}
				<div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
					{/* Title */}
					<h3
						className={cn(
							'text-sm sm:text-base font-semibold leading-snug line-clamp-1 transition-colors duration-200',
							active ? 'text-white' : 'text-zinc-200 group-hover:text-white'
						)}
					>
						{episode.name || `Episode ${episode.episode_number}`}
					</h3>

					{/* Metadata row */}
					<div className="flex items-center gap-x-2 gap-y-0">
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
				</div>
			</div>

			{/* Separator */}
			<div className="absolute bottom-0 left-[2.75rem] right-0 h-px bg-white/[0.05] pointer-events-none" />
		</motion.button>
	);
}

export const EpisodeListRow = memo(EpisodeListRowComponent);
EpisodeListRowComponent.displayName = 'EpisodeListRow';
