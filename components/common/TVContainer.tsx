'use client';

import React, { forwardRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Episode from '../container/Episode';

interface TVContainerProps {
	showId: string;
	getNextEp: any;
}

export const TVContainer = forwardRef<HTMLDivElement, TVContainerProps>(
	({ showId, getNextEp }, ref) => {
		const searchParams = useSearchParams();
		const season = searchParams.get('season');
		const episode = searchParams.get('episode');

		return (
			<div ref={ref} id="episode-player" className="w-full mb-8">
				{season && episode ? (
					<Episode
						episodeNumber={episode}
						seasonNumber={season}
						episodeId={showId}
						id={showId}
						getNextEp={getNextEp}
						key={`${season}-${episode}`}
						type="tv"
					/>
				) : null}
			</div>
		);
	}
);
