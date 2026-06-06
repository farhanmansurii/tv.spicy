'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, LockSimpleIcon, StarIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
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
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w780') : null;
	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const epNum = String(episode.episode_number).padStart(2, '0');

	const hasRating = typeof episode.vote_average === 'number' && episode.vote_average > 0;
	const hasRuntime = episode.runtime != null && episode.runtime > 0;

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
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				...itemTransition,
				delay: Math.min(index * 0.04, 0.4),
			}}
			whileTap={isReleased ? { scale: 0.97 } : undefined}
			className={cn(
				'group relative w-full h-full text-left rounded-lg sm:rounded-xl overflow-hidden will-change-transform',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				active
					? 'ring-1 ring-[#0A84FF]/40 shadow-[0_0_20px_rgba(10,132,255,0.12)]'
					: 'ring-1 ring-white/[0.06]',
				!isReleased && 'opacity-40 cursor-not-allowed'
			)}
		>
			{/* Artwork */}
			<div className="relative w-full aspect-video overflow-hidden bg-zinc-900">
				<motion.div
					className="absolute inset-0"
					whileHover={isReleased && !active ? { scale: 1.04 } : undefined}
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				>
					{stillUrl ? (
						<img
							src={stillUrl}
							alt={`Episode ${episode.episode_number}${episode.name ? `: ${episode.name}` : ''} still`}
							loading="lazy"
							className="h-full w-full object-cover"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = 'none';
							}}
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-950" />
					)}
				</motion.div>

				{/* Gradient */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

				{/* Active glow */}
				{active && (
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							background:
								'radial-gradient(ellipse at 50% 110%, rgba(10,132,255,0.12) 0%, transparent 65%)',
						}}
					/>
				)}

				{/* Play button - fades in on hover */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]">
					<motion.div
						initial={false}
						animate={
							active
								? { opacity: 1, scale: 1, y: 0 }
								: { opacity: 0, scale: 0.85, y: 4 }
						}
						whileHover={
							isReleased && !active ? { opacity: 1, scale: 1, y: 0 } : undefined
						}
						transition={{
							type: 'spring',
							stiffness: 260,
							damping: 22,
						}}
						className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md"
						style={{
							boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
						}}
					>
						<PlayIcon weight="fill" size={14} className="text-black ml-0.5" />
					</motion.div>
				</div>

				{/* Now-playing waveform */}
				{active && (
					<div className="absolute top-2.5 left-2.5 flex items-end gap-[2px] h-3 z-[3]">
						{[55, 100, 40, 75].map((h, i) => (
							<motion.span
								key={i}
								className="w-[2px] rounded-full bg-white/80"
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
					<div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm z-[4]">
						<LockSimpleIcon size={16} className="text-white/25" weight="bold" />
					</div>
				)}

				{/* Subtle inner highlight */}
				<div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] pointer-events-none" />
			</div>

			{/* Info */}
			<div
				className={cn(
					'flex flex-col gap-0.5 px-2 sm:px-2.5 pt-1.5 pb-2 sm:pt-2 sm:pb-2.5',
					active ? 'bg-[#0A84FF]/[0.06]' : 'bg-white/[0.02]'
				)}
			>
				{/* Title */}
				<h3
					className={cn(
						'text-xs sm:text-sm font-semibold leading-tight line-clamp-1 transition-colors duration-200',
						active ? 'text-white' : 'text-zinc-200 group-hover:text-white'
					)}
				>
					{episode.name || `Episode ${episode.episode_number}`}
				</h3>

				{/* Metadata row */}
				<div className="flex items-center gap-1.5">
					<span
						className={cn(
							'text-[10px] sm:text-xs font-bold tabular-nums transition-colors duration-200',
							active ? 'text-[#0A84FF]' : 'text-white/35 group-hover:text-white/50'
						)}
					>
						E{epNum}
					</span>
					{hasRuntime && (
						<>
							<span className="text-white/15 text-[8px]">&middot;</span>
							<span className="text-[10px] sm:text-xs text-white/30 tabular-nums">
								{episode.runtime}m
							</span>
						</>
					)}
					{hasRating && (
						<>
							<span className="text-white/15 text-[8px]">&middot;</span>
							<span
								className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold tabular-nums"
								style={{ color: '#FFD60A' }}
							>
								<StarIcon weight="fill" size={7} />
								{(episode.vote_average ?? 0).toFixed(1)}
							</span>
						</>
					)}
				</div>
			</div>
		</motion.button>
	);
}

export const EpisodeCard = memo(EpisodeCardComponent);
EpisodeCardComponent.displayName = 'EpisodeCard';
