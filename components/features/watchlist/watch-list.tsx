'use client';
import { Show } from '@/lib/types';
import React from 'react';
import useWatchListStore from '@/store/watchlistStore';
import MediaRow from '@/components/features/media/row/media-row';

export default function WatchList({ type }: { type: string }) {
	const { watchlist, tvwatchlist } = useWatchListStore();

	// Filter out items without backdrop_path to ensure they render properly
	const filteredMovieWatchlist = watchlist?.filter((show: Show) => show.backdrop_path) || [];
	const filteredTVWatchlist = tvwatchlist?.filter((show: Show) => show.backdrop_path) || [];

	return (
		<>
			{(type === 'movie' || type === 'all') && filteredMovieWatchlist.length > 0 && (
				<MediaRow
					isVertical={false}
					text="My Movies"
					shows={filteredMovieWatchlist}
					type="movie"
					showRank={false}
				/>
			)}

			{(type === 'tv' || type === 'all') && filteredTVWatchlist.length > 0 && (
				<MediaRow
					isVertical={false}
					text="My Shows"
					shows={filteredTVWatchlist}
					type="tv"
					showRank={false}
				/>
			)}
		</>
	);
}
