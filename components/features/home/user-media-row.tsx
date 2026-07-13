'use client';

import React, { memo, useMemo } from 'react';
import { usePersonalizedHome } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
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
	const { data, isLoading } = usePersonalizedHome();

	const watchlist = useMemo(() => {
		return ((data?.watchlist ?? []) as Array<WatchlistItem & { mediaType?: string }>)
			.filter((item) => scope === 'all' || item.mediaType?.toLowerCase() === scope)
			.map((item) =>
				buildWatchlistShow(item, item.mediaType?.toLowerCase() === 'tv' ? 'tv' : 'movie')
			);
	}, [data?.watchlist, scope]);

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
	const { data, isLoading } = usePersonalizedHome();

	const favorites = useMemo(() => {
		return (data?.favorites ?? []).filter((favorite) => {
			const mediaType = favorite.media_type?.toLowerCase();
			return scope === 'all' || mediaType === scope;
		}) as unknown as Show[];
	}, [data?.favorites, scope]);

	const filteredFavorites = useMemo(
		() => favorites.filter((show) => show.poster_path || show.backdrop_path),
		[favorites]
	);

	if (isLoading) {
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
