'use client';

import React, { memo, useMemo, useEffect, useState } from 'react';
import { useUserFavorites } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { fetchDetailsTMDB } from '@/lib/api';
import { Show } from '@/lib/types';

function UserFavoritesMoviesComponent() {
	const { data: favorites = [], isLoading } = useUserFavorites('movie');
	const [favoriteShows, setFavoriteShows] = useState<Show[]>([]);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	useEffect(() => {
		const fetchDetails = async () => {
			if (favorites.length === 0) {
				setFavoriteShows([]);
				return;
			}

			setIsLoadingDetails(true);
			try {
				const promises = favorites.map(async (fav: any) => {
					try {
						const data = await fetchDetailsTMDB(String(fav.mediaId), 'movie');
						return { ...data, media_type: 'movie' };
					} catch (error) {
						console.error(`Failed to fetch favorite ${fav.mediaId}:`, error);
						return null;
					}
				});

				const results = await Promise.all(promises);
				const validShows = results.filter((item): item is Show => item !== null);
				setFavoriteShows(validShows);
			} catch (error) {
				console.error('Error fetching favorite details:', error);
			} finally {
				setIsLoadingDetails(false);
			}
		};

		fetchDetails();
	}, [favorites]);

	const filteredFavorites = useMemo(() => {
		return favoriteShows.filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [favoriteShows]);

	if (isLoading || isLoadingDetails) {
		return <WatchlistLoader />;
	}

	if (filteredFavorites.length === 0) {
		return null;
	}

	return (
		<MediaRow
			isVertical={false}
			text="Favorite Movies"
			shows={filteredFavorites}
			type="movie"
		/>
	);
}

export const UserFavoritesMovies = memo(UserFavoritesMoviesComponent);
UserFavoritesMovies.displayName = 'UserFavoritesMovies';
