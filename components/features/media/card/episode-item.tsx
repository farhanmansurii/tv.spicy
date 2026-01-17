'use client';

import React, { useState } from 'react';
import { Play, Lock } from 'lucide-react';
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
}: EpisodeItemProps) {
	if (!episode) return null;

	const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w780') : null;

	const [isPressed, setIsPressed] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		if (!isReleased) return;
		toggle(episode, e);
	};

	const handlePressStart = () => {
		if (!isReleased) return;
		setIsPressed(true);
	};

	const handlePressEnd = () => {
		setIsPressed(false);
	};

	// ============================================
	// LIST VARIANT - Streaming Luxury Aesthetic
	// ============================================
	if (variant === 'list') {
		return (
			<button
				type="button"
				onClick={handleClick}
				onMouseDown={handlePressStart}
				onMouseUp={handlePressEnd}
				onMouseLeave={handlePressEnd}
				onTouchStart={handlePressStart}
				onTouchEnd={handlePressEnd}
				disabled={!isReleased}
				className={cn(
					// Base layout
					'group relative w-full flex items-center gap-4 p-2',
					'rounded-2xl text-left',
					// Smooth spring-like transitions
					'transition-all duration-200 ease-out',
					// Focus states for accessibility
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
					// Active vs default states
					active ? 'bg-white/[0.07] shadow-lg shadow-black/20' : 'hover:bg-white/[0.04]',
					// Press animation
					isPressed && 'scale-[0.98] transition-transform duration-100',
					// Disabled state
					!isReleased && 'opacity-40 pointer-events-none'
				)}
			>
				<div
					className={cn(
						'relative flex-shrink-0 w-32 sm:w-36 aspect-video',
						'rounded-xl overflow-hidden',
						'bg-zinc-900',
						// Subtle border that glows when active
						'ring-1 transition-all duration-300',
						active
							? 'ring-white/25 shadow-lg shadow-white/[0.03]'
							: 'ring-white/[0.08] group-hover:ring-white/15'
					)}
				>
					{stillUrl ? (
						<img
							src={stillUrl}
							alt=""
							loading="lazy"
							className={cn(
								'w-full h-full object-cover',
								'transition-transform duration-500 ease-out',
								active ? 'scale-105' : 'group-hover:scale-105'
							)}
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
					)}

					{/* Play overlay - visible on hover/active */}
					<div
						className={cn(
							'absolute inset-0 flex items-center justify-center',
							'bg-black/30 backdrop-blur-[1px]',
							'transition-all duration-200',
							active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
						)}
					>
						<div
							className={cn(
								'w-10 h-10 rounded-full flex items-center justify-center',
								'bg-white shadow-xl',
								'transition-transform duration-200',
								active ? 'scale-100' : 'scale-90 group-hover:scale-100'
							)}
						>
							<Play className="w-4 h-4 text-zinc-900 fill-zinc-900 ml-0.5" />
						</div>
					</div>

					{/* Lock overlay for unreleased episodes */}
					{!isReleased && (
						<div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
							<Lock className="w-5 h-5 text-white/40" />
						</div>
					)}
				</div>

				{/* ===== CONTENT ===== */}
				<div className="flex-1 min-w-0 py-1">
					{/* Episode number + runtime */}
					<div className="flex items-center gap-2 mb-1.5">
						<span
							className={cn(
								'text-xs font-semibold tracking-wider uppercase',
								'transition-colors duration-200',
								active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'
							)}
						>
							Episode {episode.episode_number}
						</span>
						{episode.runtime && (
							<span className="text-xs text-zinc-600 tabular-nums">
								{episode.runtime} min
							</span>
						)}
					</div>

					{/* Episode title */}
					<h3
						className={cn(
							'text-[15px] sm:text-base font-medium leading-snug',
							'truncate',
							'transition-colors duration-200',
							active ? 'text-white' : 'text-zinc-200 group-hover:text-white'
						)}
					>
						{episode.name || `Episode ${episode.episode_number}`}
					</h3>
				</div>

				{/* ===== NOW PLAYING INDICATOR ===== */}
				{active && (
					<div className="flex-shrink-0 flex items-end gap-[3px] h-4 mr-1">
						<span
							className="w-[3px] rounded-full bg-white animate-[equalize_0.8s_ease-in-out_infinite]"
							style={{ height: '60%' }}
						/>
						<span
							className="w-[3px] rounded-full bg-white animate-[equalize_0.8s_ease-in-out_infinite]"
							style={{ height: '100%', animationDelay: '0.2s' }}
						/>
						<span
							className="w-[3px] rounded-full bg-white animate-[equalize_0.8s_ease-in-out_infinite]"
							style={{ height: '40%', animationDelay: '0.4s' }}
						/>
					</div>
				)}

				{/* Ambient glow effect for active state */}
				{active && (
					<div
						className="absolute inset-0 rounded-2xl pointer-events-none"
						style={{
							background:
								'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
						}}
					/>
				)}
			</button>
		);
	}

	// ============================================
	// CARD VARIANT - Cinematic Grid Layout
	// ============================================
	return (
		<button
			type="button"
			onClick={handleClick}
			onMouseDown={handlePressStart}
			onMouseUp={handlePressEnd}
			onMouseLeave={handlePressEnd}
			onTouchStart={handlePressStart}
			onTouchEnd={handlePressEnd}
			disabled={!isReleased}
			className={cn(
				'group relative w-full aspect-[16/10] rounded-2xl overflow-hidden',
				'bg-zinc-900 text-left',
				'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
				'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				active
					? 'ring-2 ring-white/30 shadow-2xl shadow-white/[0.04]'
					: 'ring-1 ring-white/[0.06] hover:ring-white/10',
				isPressed && 'scale-[0.97]',
				!isReleased && 'opacity-50 cursor-not-allowed'
			)}
		>
			{/* Background image */}
			<div className="absolute inset-0">
				{stillUrl ? (
					<img
						src={stillUrl}
						alt=""
						loading="lazy"
						className={cn(
							'w-full h-full object-cover',
							'transition-all duration-700 ease-out',
							active
								? 'scale-105 brightness-90'
								: 'scale-100 group-hover:scale-[1.03]'
						)}
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
				)}
			</div>

			{/* Gradient overlay */}
			<div
				className={cn(
					'absolute inset-0',
					'bg-gradient-to-t from-black via-black/20 to-transparent',
					'transition-opacity duration-300',
					active ? 'opacity-90' : 'opacity-70 group-hover:opacity-85'
				)}
			/>

			{/* Content */}
			<div className="absolute inset-0 flex flex-col justify-end p-4">
				<div
					className={cn(
						'inline-flex items-center gap-1.5 mb-2',
						'transition-transform duration-300',
						active ? 'translate-y-0' : 'translate-y-1 group-hover:translate-y-0'
					)}
				>
					<span
						className={cn(
							'text-[11px] font-semibold tracking-wide uppercase',
							active ? 'text-white' : 'text-white/70'
						)}
					>
						EP {episode.episode_number}
					</span>
					{episode.runtime && (
						<>
							<span className="text-white/30">·</span>
							<span className="text-[11px] text-white/50">{episode.runtime} min</span>
						</>
					)}
				</div>

				<h3
					className={cn(
						'text-base sm:text-lg font-semibold leading-tight',
						'line-clamp-2',
						'transition-all duration-300',
						active
							? 'text-white translate-y-0'
							: 'text-white/90 translate-y-1 group-hover:translate-y-0 group-hover:text-white'
					)}
				>
					{episode.name || `Episode ${episode.episode_number}`}
				</h3>
			</div>

			{/* Center play button */}
			<div
				className={cn(
					'absolute inset-0 flex items-center justify-center',
					'transition-opacity duration-300',
					active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
				)}
			>
				<div
					className={cn(
						'w-14 h-14 rounded-full flex items-center justify-center',
						'bg-white/95 shadow-2xl shadow-black/40',
						'transition-all duration-300 ease-out',
						active ? 'scale-100' : 'scale-75 group-hover:scale-100',
						isPressed && 'scale-90'
					)}
				>
					<Play className="w-6 h-6 text-black fill-black ml-1" />
				</div>
			</div>

			{/* Now playing pulse */}
			{active && (
				<div className="absolute top-3 right-3">
					<div className="relative">
						<div className="w-2.5 h-2.5 rounded-full bg-white" />
						<div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-white animate-ping opacity-75" />
					</div>
				</div>
			)}

			{/* Lock overlay */}
			{!isReleased && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<Lock className="w-5 h-5 text-white/30" />
				</div>
			)}
		</button>
	);
}
