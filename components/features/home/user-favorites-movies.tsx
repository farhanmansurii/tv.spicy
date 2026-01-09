'use client';

import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import { useUserFavorites } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { fetchDetailsTMDB } from '@/lib/api';
import { Show } from '@/lib/types';

function UserFavoritesMoviesComponent() {
	const { data: favorites = [], isLoading } = useUserFavorites('movie');
	const [favoriteShows, setFavoriteShows] = useState<Show[]>([]);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	// Create a stable dependency based on favorite IDs to prevent infinite loops
	const favoriteIds = useMemo(() => {
		if (!favorites || favorites.length === 0) {
			return '';
		}
		return favorites.map((fav: any) => fav.mediaId).sort().join(',');
	}, [favorites]);

	const previousFavoriteIdsRef = useRef<string>('');

	useEffect(() => {
		// Skip if favoriteIds haven't actually changed
		if (previousFavoriteIdsRef.current === favoriteIds) {
			return;
		}

		previousFavoriteIdsRef.current = favoriteIds;

		const fetchDetails = async () => {
			if (!favorites || favorites.length === 0) {
				setFavoriteShows((prevShows) => {
					// Only update if state actually changed
					if (prevShows.length === 0) {
						return prevShows;
					}
					return [];
				});
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [favoriteIds]);

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
