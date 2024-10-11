'use client';
import React from 'react';
import Episode from '../container/Episode';
import SeasonTabs from '../container/Seasons';
import { TVContainer } from './TVContainer';

interface TMDBSeason {
	air_date: string;
	episode_count: number;
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	season_number: number;
}

interface ShowContainerProps {
	type: string;
	id: string;
	seasons: TMDBSeason[];
}

const ShowContainer: React.FC<ShowContainerProps> = ({ type, id, seasons }) => {
	return (
		<div className="mx-auto  max-w-3xl space-y-8 px-4 md:space-y-12 md:px-0">
			{type === 'tv' ? (
				<SeasonTabs seasons={seasons} showId={id} />
			) : (
				<div className="mx-auto my-8 max-w-3xl w-full space-y-8 px-3 md:space-y-12 md:px-0">
					<Episode episodeId={''} id={id || ''} movieID={id} type={type} />
				</div>
			)}
		</div>
	);
};

export default ShowContainer;
