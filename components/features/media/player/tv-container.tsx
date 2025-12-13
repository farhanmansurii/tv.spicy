'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Episode from '@/components/features/media/episode/episode';

interface TVContainerProps {
	showId: string;
	getNextEp: any;
}

export const TVContainer: React.FC<TVContainerProps> = ({ showId, getNextEp }) => {
	const searchParams = useSearchParams();
	const season = searchParams.get('season');
	const episode = searchParams.get('episode');

	return (
		<div className="w-full mb-8">
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
};
