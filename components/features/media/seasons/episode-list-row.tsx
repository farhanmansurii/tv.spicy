'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
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
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/50 focus-visible:ring-inset',
				!isReleased && 'opacity-40 cursor-not-allowed'
			)}
		>
			{/* Active left bar */}
			<motion.div
				className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-[#0A84FF]"
				initial={false}
				animate={active ? { opacity: 1 } : { opacity: 0 }}
				transition={{ duration: 0.3 }}
			/>

			<div
				className={cn(
					'flex items-center gap-3 sm:gap-3.5 w-full px-3 py-2.5 rounded-xl transition-colors duration-200',
					active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
				)}
			>
				{/* Episode number */}
				<div
					className={cn(
						'flex-shrink-0 w-7 text-center tabular-nums font-black leading-none select-none transition-colors duration-300',
						active ? 'text-[#0A84FF]' : 'text-white/20 group-hover:text-white/35'
					)}
					style={{
						fontSize: 'clamp(0.875rem, 2vw, 1rem)',
						fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
						letterSpacing: '-0.04em',
					}}
				>
					{epNum}
				</div>

				{/* Thumbnail */}
				<div
					className={cn(
						'relative flex-shrink-0 w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-zinc-900',
						active
							? 'shadow-[0_0_0_1.5px_rgba(255,255,255,0.18),0_6px_20px_rgba(0,0,0,0.65)]'
							: 'shadow-[0_0_0_1px_rgba(255,255,255,0.07)]'
					)}
				>
					<motion.div
						className="absolute inset-0"
						whileHover={isReleased && !active ? { scale: 1.04 } : undefined}
						transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
					>
						{stillUrl ? (
							<Image
								src={stillUrl}
								alt={`Episode ${episode.episode_number}${episode.name ? `: ${episode.name}` : ''} thumbnail`}
								fill
								loading="lazy"
								sizes="128px"
								className="object-cover"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
						)}
					</motion.div>

					{/* Play overlay */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							initial={false}
							animate={
								active
									? { opacity: 1, scale: 1 }
									: { opacity: 0, scale: 0.7 }
							}
							whileHover={
								isReleased && !active
									? { opacity: 1, scale: 1 }
									: undefined
							}
							transition={{
								type: 'spring',
								stiffness: 260,
								damping: 22,
							}}
							className="w-8 h-8 rounded-full flex items-center justify-center"
							style={{
								background: 'rgba(255,255,255,0.9)',
								backdropFilter: 'blur(12px)',
								border: '1px solid rgba(255,255,255,0.25)',
								boxShadow: '0 3px 14px rgba(0,0,0,0.55)',
							}}
						>
							<PlayIcon weight="fill" size={12} className="text-black ml-px" />
						</motion.div>
					</div>

					{/* Waveform */}
					{active && (
						<div className="absolute bottom-1.5 right-1.5 flex items-end gap-[2px] h-2.5">
							{[55, 100, 40, 75].map((h, i) => (
								<motion.span
									key={i}
									className="w-[2px] rounded-full"
									style={{ background: '#0A84FF', opacity: 0.9 }}
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
							<LockSimpleIcon size={13} className="text-white/30" weight="bold" />
						</div>
					)}

					<div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
				</div>

				{/* Text */}
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 mb-0.5">
						{episode.runtime != null && episode.runtime > 0 && (
							<span className="text-[10.5px] text-white/28 tabular-nums">
								{episode.runtime}m
							</span>
							)}
						{typeof episode.vote_average === 'number' && episode.vote_average > 0 && (
							<span
								className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold tabular-nums"
								style={{ color: '#FFD60A' }}
							>
								<StarIcon weight="fill" size={8} />
								{(episode.vote_average ?? 0).toFixed(1)}
							</span>
							)}
						{airLabel && (
							<span className="text-[10.5px] text-white/20 tabular-nums">{airLabel}</span>
							)}
						{!isReleased && (
							<span className="text-[10px] font-medium text-white/15 uppercase tracking-wider">
								Upcoming
							</span>
							)}
						</div>

					<h3
						className={cn(
							'text-[13px] sm:text-[13.5px] font-semibold leading-snug line-clamp-1 transition-colors duration-200',
							active ? 'text-white' : 'text-zinc-300 group-hover:text-white'
						)}
						style={{
							fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
						}}
					>
						{episode.name || `Episode ${episode.episode_number}`}
					</h3>

					{episode.overview && (
						<p
							className={cn(
								'text-[11.5px] leading-relaxed mt-0.5 line-clamp-2 transition-colors duration-200',
								active ? 'text-white/50' : 'text-white/30 group-hover:text-white/42'
							)}
						>
							{episode.overview}
						</p>
					)}
				</div>
			</div>

			<div className="absolute bottom-0 left-[2.75rem] right-0 h-px bg-white/[0.04] pointer-events-none" />
		</motion.button>
	);
}

export const EpisodeListRow = memo(EpisodeListRowComponent);
EpisodeListRowComponent.displayName = 'EpisodeListRow';
