'use client'

import * as React from 'react'
import { HeartIcon } from '@phosphor-icons/react'

import type { Show } from '@/lib/types'
import { useFavoritesStore } from '@/store/favoritesStore'
import MediaCard from '@/components/features/media/card/media-card'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

function toDisplayShow(item: any, type: 'movie' | 'tv'): Show | null {
	if (!item || typeof item !== 'object') return null
	return {
		id: item.id,
		title: item.title,
		name: item.name || item.title,
		poster_path: item.poster_path,
		backdrop_path: item.backdrop_path,
		overview: item.overview,
		media_type: type,
	} as Show
}

export function LibraryFavoritesSynced() {
	const hasMounted = useHasMounted()
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies)
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV)

	const movieFavorites = React.useMemo(() => {
		return favoriteMovies
			.map((item) => toDisplayShow(item, 'movie'))
			.filter((show): show is Show => Boolean(show))
	}, [favoriteMovies])

	const tvFavorites = React.useMemo(() => {
		return favoriteTV
			.map((item) => toDisplayShow(item, 'tv'))
			.filter((show): show is Show => Boolean(show))
	}, [favoriteTV])

	const totalCount = movieFavorites.length + tvFavorites.length

	if (!hasMounted) {
		return null
	}

	if (totalCount === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="w-16 h-16 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex items-center justify-center">
					<HeartIcon size={28} className="text-muted-foreground/50" />
				</div>
				<h3 className="text-lg font-semibold text-foreground">No favorites yet</h3>
				<p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
					Start adding shows and movies to your favorites by clicking the heart icon on any details page.
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col space-y-8 md:space-y-10">
			{movieFavorites.length > 0 && (
				<div className="space-y-4 md:space-y-5">
					<div>
						<p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">
							Movies
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{movieFavorites.length} {movieFavorites.length === 1 ? 'movie' : 'movies'}
						</p>
					</div>
					<div
						className={cn(
							'grid gap-4 md:gap-6',
							'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
						)}
					>
						{movieFavorites.map((show, index) => (
							<MediaCard key={show.id} type="movie" show={show} index={index} isVertical />
						))}
					</div>
				</div>
			)}

			{tvFavorites.length > 0 && (
				<div className="space-y-4 md:space-y-5">
					<div>
						<p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">
							TV Shows
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{tvFavorites.length} {tvFavorites.length === 1 ? 'show' : 'shows'}
						</p>
					</div>
					<div
						className={cn(
							'grid gap-4 md:gap-6',
							'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
						)}
					>
						{tvFavorites.map((show, index) => (
							<MediaCard key={show.id} type="tv" show={show} index={index} isVertical />
						))}
					</div>
				</div>
			)}
		</div>
	)
}
