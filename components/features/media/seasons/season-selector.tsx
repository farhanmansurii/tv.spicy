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

function SeasonSelectorComponent({ seasons, activeSeason, onSeasonChange }: SeasonSelectorProps) {
	return (
		<div className="overflow-x-auto scrollbar-none">
			<div className="flex min-w-max gap-6 border-b border-white/[0.06]">
				{seasons.map((season) => {
					const isActive = season.season_number === activeSeason;
					const count =
						typeof season.episode_count === 'number' && season.episode_count > 0
							? season.episode_count
							: null;

					return (
						<button
							key={season.season_number}
							type="button"
							onClick={() => onSeasonChange(season.season_number)}
							className={cn(
								'relative pb-3 text-[13px] font-semibold transition-colors duration-200',
								isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
							)}
						>
							Season {season.season_number}
							{count != null && (
								<span
									className={cn(
										'ml-1 text-[11px] tabular-nums',
										isActive ? 'text-white/35' : 'text-white/20'
									)}
								>
									({count})
								</span>
								)}
								{isActive && (
									<motion.div
										layoutId="seasonTabIndicator"
										className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
										transition={{ type: 'spring', stiffness: 400, damping: 30 }}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>
		);
	}

export const SeasonSelector = memo(SeasonSelectorComponent);
SeasonSelectorComponent.displayName = 'SeasonSelector';
