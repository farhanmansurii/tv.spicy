'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
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
			whileHover={isReleased ? { y: -3 } : undefined}
			whileTap={isReleased ? { scale: 0.97 } : undefined}
			className={cn(
				'group relative w-full text-left rounded-2xl overflow-hidden will-change-transform',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				active
					? 'shadow-[0_0_0_1.5px_rgba(255,255,255,0.22),0_20px_50px_rgba(0,0,0,0.8)]'
					: 'shadow-[0_0_0_1px_rgba(255,255,255,0.07)]',
				!isReleased && 'opacity-40 cursor-not-allowed'
			)}
		>
			{/* Artwork */}
			<div className="relative w-full aspect-video overflow-hidden bg-zinc-900">
				<motion.div
					className="absolute inset-0"
					whileHover={isReleased && !active ? { scale: 1.06 } : undefined}
					transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
				>
					{stillUrl ? (
						<Image
							src={stillUrl}
							alt={`Episode ${episode.episode_number}${episode.name ? `: ${episode.name}` : ''} still`}
							fill
							loading="lazy"
							sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
							className="object-cover"
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-950" />
					)}
				</motion.div>

				{/* Gradient */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

				{/* Ghost episode number */}
				<div
					className="absolute top-1 right-2 select-none pointer-events-none leading-none"
					style={{
						fontSize: 'clamp(2.8rem, 6vw, 5rem)',
						fontWeight: 900,
						color: 'rgba(255,255,255,0.055)',
						fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
						letterSpacing: '-0.05em',
						mixBlendMode: 'screen',
						lineHeight: 1,
					}}
				>
					{epNum}
				</div>

				{/* Active glow */}
				{active && (
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							background:
								'radial-gradient(ellipse at 50% 110%, rgba(10,132,255,0.15) 0%, transparent 65%)',
						}}
					/>
				)}

				{/* Play button */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]">
					<motion.div
						initial={false}
						animate={
							active
								? { opacity: 1, scale: 1, y: 0 }
								: { opacity: 0, scale: 0.78, y: 6 }
						}
						whileHover={
							isReleased && !active
								? { opacity: 1, scale: 1, y: 0 }
								: undefined
						}
						transition={{
							type: 'spring',
							stiffness: 260,
							damping: 22,
						}}
						className="w-11 h-11 rounded-full flex items-center justify-center"
						style={{
							background: 'rgba(255,255,255,0.92)',
							backdropFilter: 'blur(20px) saturate(180%)',
							border: '1px solid rgba(255,255,255,0.28)',
							boxShadow:
								'0 6px 28px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
						}}
					>
						<PlayIcon weight="fill" size={16} className="text-black ml-0.5" />
					</motion.div>
				</div>

				{/* Now-playing waveform */}
				{active && (
					<div className="absolute top-3 left-3 flex items-end gap-[2.5px] h-3.5 z-[3]">
						{[55, 100, 40, 75].map((h, i) => (
							<motion.span
								key={i}
								className="w-[2.5px] rounded-full"
								style={{ background: 'rgba(255,255,255,0.75)' }}
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
						<LockSimpleIcon size={18} className="text-white/25" weight="bold" />
					</div>
				)}

				{/* Inner edge refraction */}
				<div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
			</div>

			{/* Info */}
			<div
				className={cn(
					'px-3 pt-2.5 pb-3 transition-colors duration-200',
					active
						? 'bg-white/[0.07]'
						: 'bg-white/[0.028] group-hover:bg-white/[0.045]'
				)}
				style={active ? { borderTop: '1px solid rgba(10,132,255,0.12)' } : { borderTop: '1px solid transparent' }}
			>
				{/* Eyebrow */}
				<div className="flex items-center gap-1.5 mb-1">
					<span
						className={cn(
							'text-[9.5px] font-black uppercase tracking-[0.15em] tabular-nums transition-colors duration-200',
							active ? 'text-[#0A84FF]' : 'text-white/35 group-hover:text-white/50'
						)}
					>
						E{epNum}
					</span>
					{hasRuntime && (
						<>
							<span className="text-white/15 text-[8px]">&middot;</span>
							<span className="text-[9.5px] text-white/28 tabular-nums">
								{episode.runtime}m
							</span>
						</>
					)}
					{hasRating && (
						<>
							<span className="text-white/15 text-[8px]">&middot;</span>
							<span
								className="inline-flex items-center gap-0.5 text-[9.5px] font-bold tabular-nums"
								style={{ color: '#FFD60A' }}
							>
								<StarIcon weight="fill" size={7} />
								{(episode.vote_average ?? 0).toFixed(1)}
							</span>
						</>
					)}
				</div>

				{/* Title */}
				<h3
					className={cn(
						'text-[13px] sm:text-[13.5px] font-semibold leading-snug line-clamp-1 transition-colors duration-200',
						active ? 'text-white' : 'text-zinc-200 group-hover:text-white'
					)}
					style={{
						fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
					}}
				>
					{episode.name || `Episode ${episode.episode_number}`}
				</h3>

				{/* Overview */}
				{episode.overview && (
					<p
						className={cn(
							'mt-1 text-[11px] leading-relaxed line-clamp-2 transition-colors duration-200',
							active ? 'text-white/55' : 'text-white/30 group-hover:text-white/44'
						)}
					>
						{episode.overview}
					</p>
				)}
			</div>
		</motion.button>
	);
}

export const EpisodeCard = memo(EpisodeCardComponent);
EpisodeCardComponent.displayName = 'EpisodeCard';
