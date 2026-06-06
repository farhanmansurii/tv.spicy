'use client';

import React, { useMemo, memo, useCallback } from 'react';
import { HeartIcon, TrashIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { toast } from 'sonner';
import { Show } from '@/lib/types';
import { useFavoritesStore, FavoriteItem } from '@/store/favoritesStore';

function MyFavoritesComponent() {
	const hasMounted = useHasMounted();
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies);
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV);

	const handleClearFavorites = useCallback(() => {
		const { clearFavorites } = useFavoritesStore.getState();
		clearFavorites();
		toast.success('Favorites cleared', {
			description: 'All favorites have been removed.',
		});
	}, []);

	// Convert store items to Show shape for MediaRow
	const toShow = useCallback(
		(item: FavoriteItem, type: 'movie' | 'tv'): Show => ({
			id: item.id,
			title: item.title ?? '',
			name: item.name || item.title || '',
			poster_path: item.poster_path ?? null,
			backdrop_path: item.backdrop_path ?? null,
			media_type: type,
			overview: item.overview ?? '',
			adult: false,
			genre_ids: [],
			original_language: '',
			original_title: '',
			original_name: '',
			genres: [],
			tagline: '',
			popularity: 0,
			first_air_date: '',
			release_date: '',
			video: false,
			vote_average: 0,
			vote_count: 0,
			spoken_languages: [],
		}),
		[]
	);

	const movieFavorites = useMemo(() => {
		return favoriteMovies.map((item) => toShow(item, 'movie'));
	}, [favoriteMovies, toShow]);

	const tvFavorites = useMemo(() => {
		return favoriteTV.map((item) => toShow(item, 'tv'));
	}, [favoriteTV, toShow]);

	const totalCount = movieFavorites.length + tvFavorites.length;

	if (!hasMounted) {
		return null;
	}

	if (totalCount === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
					<HeartIcon size={32} className="text-zinc-600" />
				</div>
				<h3 className="text-xl font-bold text-foreground">No favorites yet</h3>
				<p className="text-muted-foreground text-center max-w-md">
					Start adding shows and movies to your favorites by clicking the heart icon on
					any details page.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header with clear button */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">My Favorites</h2>
					<p className="text-sm text-muted-foreground mt-1">
						{totalCount} {totalCount === 1 ? 'item' : 'items'} saved
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClearFavorites}
					className="text-muted-foreground hover:text-red-500 transition-colors gap-2"
				>
					<TrashIcon size={16} />
					<span className="hidden sm:inline">Clear All</span>
				</Button>
			</div>

			{/* Movie Favorites */}
			{movieFavorites.length > 0 && (
				<MediaRow
					text="Favorite Movies"
					shows={movieFavorites}
					type="movie"
					isVertical={false}
				/>
			)}

			{/* TV Favorites */}
			{tvFavorites.length > 0 && (
				<MediaRow
					text="Favorite TV Shows"
					shows={tvFavorites}
					type="tv"
					isVertical={false}
				/>
			)}
		</div>
	);
}

export const MyFavorites = memo(MyFavoritesComponent);
MyFavorites.displayName = 'MyFavorites';
