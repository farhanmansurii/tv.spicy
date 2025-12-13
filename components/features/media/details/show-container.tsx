'use client';
import React from 'react';
import Episode from '@/components/features/media/episode/episode';
import SeasonTabs from '@/components/features/media/seasons/season-tabs';
import { Show } from '@/lib/types';

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
	showData: Show;
}

const ShowContainer: React.FC<ShowContainerProps> = ({ type, id, seasons, showData }) => {
	return (
		<>
			{type === 'tv' ? (
				<SeasonTabs seasons={seasons} showId={id} showData={showData} />
			) : (
				<Episode episodeId={''} id={id || ''} movieID={id} type={type} />
			)}
		</>
	);
};

export default ShowContainer;
