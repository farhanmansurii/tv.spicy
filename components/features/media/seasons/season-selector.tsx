'use client';

import React, { memo, useMemo } from 'react';
import {
	EditorialTabs,
	EditorialTabList,
	EditorialTabTrigger,
} from '@/components/ui/editorial-tabs';
import { cn } from '@/lib/utils';

export interface Season {
	season_number: number;
	name?: string;
	episode_count?: number;
}

export interface SeasonSelectorProps {
	seasons: Season[];
	activeSeason: number;
	onSeasonChange: (seasonNumber: number) => void;
	className?: string;
}

function SeasonSelectorComponent({
	seasons,
	activeSeason,
	onSeasonChange,
	className,
}: SeasonSelectorProps) {
	const orderedSeasons = useMemo(() => {
		const regular = seasons
			.filter((s) => s.season_number > 0)
			.sort((a, b) => a.season_number - b.season_number);
		const specials = seasons.filter((s) => s.season_number === 0);
		return [...regular, ...specials];
	}, [seasons]);

	if (orderedSeasons.length <= 1) return null;

	return (
		<div className={cn('w-full', className)}>
			<EditorialTabs
				value={String(activeSeason)}
				onValueChange={(val) => onSeasonChange(Number(val))}
				ariaLabel="Seasons"
			>
				<EditorialTabList ariaLabel="Seasons">
					{orderedSeasons.map((season) => {
						const label =
							season.season_number === 0
								? 'SPECIALS'
								: `SEASON ${String(season.season_number).padStart(2, '0')}`;
						return (
							<EditorialTabTrigger
								key={season.season_number}
								value={String(season.season_number)}
							>
								{label}
							</EditorialTabTrigger>
						);
					})}
				</EditorialTabList>
			</EditorialTabs>
		</div>
	);
}

export const SeasonSelector = memo(SeasonSelectorComponent);
