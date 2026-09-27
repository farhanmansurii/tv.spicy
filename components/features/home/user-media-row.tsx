'use client';

import React, { memo, useMemo } from 'react';
import { usePersonalizedHome } from '@/hooks/use-user-data';
import MediaRow from '@/components/features/media/row/media-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import type { Show } from '@/lib/types';
import type { PersonalizedHomeData } from '@/lib/types/personalized-home';

export type UserMediaScope = 'movie' | 'tv' | 'all';
export type UserMediaVariant = 'watchlist' | 'favorites';

export interface UserMediaRowProps {
	variant: UserMediaVariant;
	scope: UserMediaScope;
	text?: string;
	rowNumber?: number;
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

export function hasUserMediaItems(
	variant: UserMediaVariant,
	scope: UserMediaScope,
	data: PersonalizedHomeData | undefined
): boolean {
	if (!data) return false;
	if (variant === 'watchlist') {
		return data.watchlist.some(
			(item) =>
				(scope === 'all' || item.mediaType?.toLowerCase() === scope) &&
				Boolean(item.posterPath || item.backdropPath)
		);
	}
	return data.favorites.some(
		(item) =>
			(scope === 'all' || item.media_type?.toLowerCase() === scope) &&
			Boolean(item.poster_path || item.backdrop_path)
	);
}

function UserWatchlistRow({ scope, text, rowNumber }: UserMediaRowProps) {
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
		return <MediaLoader withHeader className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />;
	}

	if (filteredWatchlist.length === 0) {
		return null;
	}

	return (
		<MediaRow
			text={text || defaultTitles.watchlist[scope]}
			shows={filteredWatchlist}
			type={scope === 'movie' ? 'movie' : 'tv'}
			rowNumber={rowNumber}
		/>
	);
}

function UserFavoritesRow({ scope, text, rowNumber }: UserMediaRowProps) {
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
		return <MediaLoader withHeader className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />;
	}

	if (filteredFavorites.length === 0) {
		return null;
	}

	return (
		<MediaRow
			text={text || defaultTitles.favorites[scope]}
			shows={filteredFavorites}
			type={scope === 'movie' ? 'movie' : 'tv'}
			rowNumber={rowNumber}
		/>
	);
}

function UserMediaRowComponent({ variant, scope, text, rowNumber }: UserMediaRowProps) {
	return variant === 'watchlist' ? (
		<UserWatchlistRow variant={variant} scope={scope} text={text} rowNumber={rowNumber} />
	) : (
		<UserFavoritesRow variant={variant} scope={scope} text={text} rowNumber={rowNumber} />
	);
}

export const UserMediaRow = memo(UserMediaRowComponent);
UserMediaRow.displayName = 'UserMediaRow';
