'use client';

import React, { memo, useMemo } from 'react';
import { useUserWatchlist } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { Show } from '@/lib/types';

function UserWatchlistAllComponent() {
	const { data: watchlistMovies = [], isLoading: isLoadingMovies } = useUserWatchlist('movie');
	const { data: watchlistTV = [], isLoading: isLoadingTV } = useUserWatchlist('tv');

	const isLoading = isLoadingMovies || isLoadingTV;

	const combinedWatchlist = useMemo(() => {
		const movies = watchlistMovies.map((item: any) => ({
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
		} as Show));

		const tvShows = watchlistTV.map((item: any) => ({
			id: item.mediaId,
			title: item.title || '',
			name: item.title || '',
			poster_path: item.posterPath || '',
			backdrop_path: item.backdropPath || '',
			overview: item.overview || '',
			media_type: 'tv',
			first_air_date: '',
			release_date: '',
			vote_average: 0,
			adult: false,
			genre_ids: [],
			original_language: 'en',
			original_title: '',
			original_name: item.title || '',
			genres: [],
			tagline: '',
			popularity: 0,
			video: false,
			vote_count: 0,
			spoken_languages: [],
		} as Show));

		return [...movies, ...tvShows].filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [watchlistMovies, watchlistTV]);

	if (isLoading) {
		return <WatchlistLoader />;
	}

	if (combinedWatchlist.length === 0) {
		return null;
	}

	return (
		<MediaRow
			text="My Watchlist"
			shows={combinedWatchlist}
			type="tv"
		/>
	);
}

export const UserWatchlistAll = memo(UserWatchlistAllComponent);
UserWatchlistAll.displayName = 'UserWatchlistAll';
