'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Season {
	season_number: number;
	name?: string;
	episode_count?: number;
}

interface SeasonSelectorProps {
	seasons: Season[];
	activeSeason: number;
	onSeasonChange: (seasonNumber: number) => void;
}

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.035,
			delayChildren: 0.03,
		},
	},
};

const pillVariants = {
	hidden: { y: 6, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 28,
		},
	},
};

function SeasonSelectorComponent({ seasons, activeSeason, onSeasonChange }: SeasonSelectorProps) {
	return (
		<div
			className="relative inline-flex max-w-full overflow-hidden rounded-full"
			style={{
				background: 'rgba(255,255,255,0.05)',
				border: '1px solid rgba(255,255,255,0.08)',
				padding: '3px',
				WebkitMaskImage:
					'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
				maskImage:
					'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
			}}
		>
			<motion.div
				className="relative flex items-center overflow-x-auto"
				style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{seasons.map((season) => {
					const isActive = season.season_number === activeSeason;
					const hasCount =
						typeof season.episode_count === 'number' && season.episode_count > 0;

					return (
						<motion.button
							key={season.season_number}
							variants={pillVariants}
							onClick={() => onSeasonChange(season.season_number)}
							whileHover={!isActive ? { scale: 1.04 } : undefined}
							whileTap={!isActive ? { scale: 0.96 } : { scale: 0.98 }}
							className={cn(
								'relative z-[1] flex-shrink-0 flex items-center gap-1.5 rounded-full',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
								hasCount ? 'pl-3 pr-2 py-[6px]' : 'px-3 py-[6px]'
							)}
						>
							{/* Sliding indicator — shared element morph */}
							{isActive && (
								<motion.div
									layoutId="seasonIndicator"
									className="absolute inset-0 rounded-full pointer-events-none"
									style={{
										background: 'rgba(255,255,255,0.96)',
										boxShadow:
											'0 1px 6px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
									}}
									transition={{
										type: 'spring',
										stiffness: 420,
										damping: 30,
									}}
								/>
							)}

							<span
								className={cn(
									'relative text-[12px] font-semibold leading-none tabular-nums transition-colors duration-150 select-none',
									isActive ? 'text-zinc-900' : 'text-white/45'
								)}
								style={{
									fontFamily:
										'-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
								}}
							>
								Season {season.season_number}
							</span>

							{hasCount && (
								<span
									className={cn(
										'relative leading-none tabular-nums rounded-full px-[4.5px] py-[2px] text-[9px] font-bold transition-all duration-150 select-none',
										isActive
											? 'bg-black/10 text-zinc-800/60'
											: 'bg-white/[0.08] text-white/25'
									)}
								>
									{season.episode_count} eps
								</span>
							)}
						</motion.button>
					);
				})}
			</motion.div>
		</div>
	);
}

export const SeasonSelector = memo(SeasonSelectorComponent);
SeasonSelectorComponent.displayName = 'SeasonSelector';
