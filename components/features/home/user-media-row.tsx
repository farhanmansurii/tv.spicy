'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useUserFavorites, useUserWatchlist } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { fetchDetailsTMDB } from '@/lib/api';
import type { Show } from '@/lib/types';

export type UserMediaScope = 'movie' | 'tv' | 'all';
export type UserMediaVariant = 'watchlist' | 'favorites';

export interface UserMediaRowProps {
	variant: UserMediaVariant;
	scope: UserMediaScope;
	text?: string;
}

type WatchlistItem = {
	mediaId: number;
	title?: string;
	posterPath?: string | null;
	backdropPath?: string | null;
	overview?: string | null;
};

type FavoriteItem = {
	mediaId: number;
	mediaType?: string;
};

const defaultTitles: Record<UserMediaVariant, Record<UserMediaScope, string>> = {
	watchlist: {
		movie: 'My Movies',
		tv: 'My Shows',
		all: 'My Watchlist',
	},
	favorites: {
		movie: 'Favorite Movies',
		tv: 'Favorite TV Shows',
		all: 'My Favorites',
	},
};

const buildWatchlistShow = (item: WatchlistItem, mediaType: 'movie' | 'tv'): Show => ({
	id: item.mediaId,
	title: item.title || '',
	name: item.title || '',
	poster_path: item.posterPath || '',
	backdrop_path: item.backdropPath || '',
	overview: item.overview || '',
	media_type: mediaType,
	first_air_date: '',
	release_date: '',
	vote_average: 0,
	adult: false,
	genre_ids: [],
	original_language: 'en',
	original_title: mediaType === 'movie' ? item.title || '' : '',
	original_name: mediaType === 'tv' ? item.title || '' : '',
	genres: [],
	tagline: '',
	popularity: 0,
	video: false,
	vote_count: 0,
	spoken_languages: [],
});

function UserWatchlistRow({ scope, text }: UserMediaRowProps) {
	const { data: watchlistMovies = [], isLoading: isLoadingMovies } = useUserWatchlist('movie');
	const { data: watchlistTV = [], isLoading: isLoadingTV } = useUserWatchlist('tv');

	const isLoading =
		scope === 'all'
			? isLoadingMovies || isLoadingTV
			: scope === 'movie'
				? isLoadingMovies
				: isLoadingTV;

	const watchlist = useMemo(() => {
		if (scope === 'movie') {
			return (watchlistMovies as WatchlistItem[]).map((item) =>
				buildWatchlistShow(item, 'movie')
			);
		}
		if (scope === 'tv') {
			return (watchlistTV as WatchlistItem[]).map((item) => buildWatchlistShow(item, 'tv'));
		}
		const movies = (watchlistMovies as WatchlistItem[]).map((item) =>
			buildWatchlistShow(item, 'movie')
		);
		const tv = (watchlistTV as WatchlistItem[]).map((item) => buildWatchlistShow(item, 'tv'));
		return [...movies, ...tv];
	}, [scope, watchlistMovies, watchlistTV]);

	const filteredWatchlist = useMemo(
		() => watchlist.filter((show) => show.poster_path || show.backdrop_path),
		[watchlist]
	);

	if (isLoading) {
		return <MediaLoader withHeader className="min-h-[280px]" />;
	}

	if (filteredWatchlist.length === 0) {
		return null;
	}

	return (
		<MediaRow
			text={text || defaultTitles.watchlist[scope]}
			shows={filteredWatchlist}
			type={scope === 'movie' ? 'movie' : 'tv'}
		/>
	);
}

function UserFavoritesRow({ scope, text }: UserMediaRowProps) {
	const { data: favoritesMovies = [], isLoading: isLoadingMovies } = useUserFavorites('movie');
	const { data: favoritesTV = [], isLoading: isLoadingTV } = useUserFavorites('tv');
	const [favoriteShows, setFavoriteShows] = useState<Show[]>([]);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	const favorites = useMemo(() => {
		if (scope === 'movie') return favoritesMovies as FavoriteItem[];
		if (scope === 'tv') return favoritesTV as FavoriteItem[];
		return [...(favoritesMovies as FavoriteItem[]), ...(favoritesTV as FavoriteItem[])];
	}, [favoritesMovies, favoritesTV, scope]);

	const favoriteIds = useMemo(() => {
		if (!favorites || favorites.length === 0) return '';
		return favorites
			.map((fav) => `${fav.mediaType || (scope === 'tv' ? 'TV' : 'MOVIE')}:${fav.mediaId}`)
			.sort()
			.join(',');
	}, [favorites, scope]);

	const previousFavoriteIdsRef = useRef<string>('');

	useEffect(() => {
		if (previousFavoriteIdsRef.current === favoriteIds) {
			return;
		}

		previousFavoriteIdsRef.current = favoriteIds;

		const fetchDetails = async () => {
			if (!favorites || favorites.length === 0) {
				setFavoriteShows((prevShows) => (prevShows.length === 0 ? prevShows : []));
				return;
			}

			setIsLoadingDetails(true);
			try {
				const promises = favorites.map(async (fav) => {
					try {
						const mediaType = fav.mediaType
							? fav.mediaType.toLowerCase()
							: scope === 'tv'
								? 'tv'
								: 'movie';
						const data = await fetchDetailsTMDB(
							String(fav.mediaId),
							mediaType as 'movie' | 'tv'
						);
						return data ? ({ ...data, media_type: mediaType } as Show) : null;
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
	}, [favoriteIds, favorites, scope]);

	const filteredFavorites = useMemo(
		() => favoriteShows.filter((show) => show.poster_path || show.backdrop_path),
		[favoriteShows]
	);

	const isLoading =
		scope === 'all'
			? isLoadingMovies || isLoadingTV
			: scope === 'movie'
				? isLoadingMovies
				: isLoadingTV;

	if (isLoading || isLoadingDetails) {
		return <MediaLoader withHeader className="min-h-[280px]" />;
	}

	if (filteredFavorites.length === 0) {
		return null;
	}

	return (
		<MediaRow
			text={text || defaultTitles.favorites[scope]}
			shows={filteredFavorites}
			type={scope === 'movie' ? 'movie' : 'tv'}
		/>
	);
}

function UserMediaRowComponent({ variant, scope, text }: UserMediaRowProps) {
	return variant === 'watchlist' ? (
		<UserWatchlistRow variant={variant} scope={scope} text={text} />
	) : (
		<UserFavoritesRow variant={variant} scope={scope} text={text} />
	);
}

export const UserMediaRow = memo(UserMediaRowComponent);
UserMediaRow.displayName = 'UserMediaRow';
