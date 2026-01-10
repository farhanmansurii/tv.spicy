'use client';

import React, { memo, useMemo } from 'react';
import { useUserWatchlist } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { Show } from '@/lib/types';

function UserWatchlistMoviesComponent() {
	const { data: watchlist = [], isLoading } = useUserWatchlist('movie');

	const filteredWatchlist = useMemo(() => {
		return watchlist
			.map((item: any) => ({
				id: item.mediaId,
				title: item.title || '',
				name: item.title || '',
				poster_path: item.posterPath || '',
				backdrop_path: item.backdropPath || '',
				overview: item.overview || '',
				media_type: 'movie',
				first_air_date: '',
				release_date: '',
				vote_average: 0,
				adult: false,
				genre_ids: [],
				original_language: 'en',
				original_title: item.title || '',
				original_name: '',
				genres: [],
				tagline: '',
				popularity: 0,
				video: false,
				vote_count: 0,
				spoken_languages: [],
			} as Show))
			.filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [watchlist]);

	if (isLoading) {
		return <WatchlistLoader />;
	}

	if (filteredWatchlist.length === 0) {
		return null;
	}

	return (
		<MediaRow
			text="My Movies"
			shows={filteredWatchlist}
			type="movie"
		/>
	);
}

export const UserWatchlistMovies = memo(UserWatchlistMoviesComponent);
UserWatchlistMovies.displayName = 'UserWatchlistMovies';
