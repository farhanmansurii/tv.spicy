'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Episode from '@/components/features/media/episode/episode';
import {
	parseEpisodeParam,
	parseSeasonParam,
} from '@/components/features/media/player/deep-link-params';

interface TVContainerProps {
	showId: string;
	getNextEp: any;
	isSticky?: boolean;
	onCloseSticky?: () => void;
	/** Season numbers the show actually has; out-of-list deep links are ignored. */
	seasons?: readonly number[];
	/** Episode count of the deep-linked season, when it is loaded. */
	episodeCount?: number;
}

export const TVContainer: React.FC<TVContainerProps> = ({
	showId,
	getNextEp,
	isSticky,
	onCloseSticky,
	seasons,
	episodeCount,
}) => {
	const searchParams = useSearchParams();
	const season = parseSeasonParam(searchParams.get('season'), seasons);
	const episode = parseEpisodeParam(searchParams.get('episode'), episodeCount);

	return season !== null && episode !== null ? (
		<div className="w-full">
			<Episode
				episodeNumber={episode}
				seasonNumber={season}
				episodeId={showId}
				id={showId}
				getNextEp={getNextEp}
				isSticky={isSticky}
				onCloseSticky={onCloseSticky}
				key={`${season}-${episode}`}
				type="tv"
			/>
		</div>
	) : null;
};
