'use client'

import * as React from 'react'
import { HeartIcon } from '@phosphor-icons/react'

import type { Show } from '@/lib/types'
import { useFavoritesStore } from '@/store/favoritesStore'
import MediaCard from '@/components/features/media/card/media-card'
import { ReelEmptyState } from './reel-empty-state'
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
			<ReelEmptyState
				icon={<HeartIcon size={24} />}
				title="No favorites on the reel."
				caption="Mark a film or series as a favorite to keep it close."
				actionLabel="Find a favorite"
			/>
		)
	}

	return (
		<div className="flex flex-col gap-8 md:gap-10">
			{movieFavorites.length > 0 && (
				<div className="flex flex-col gap-4 md:gap-5">
					<div>
						<p className="font-mono text-micro font-medium uppercase tracking-meta-wide text-muted-foreground">
							Movies
						</p>
						<p className="mt-1 font-mono text-micro uppercase tracking-meta text-muted-foreground">
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
				<div className="flex flex-col gap-4 md:gap-5">
					<div>
						<p className="font-mono text-micro font-medium uppercase tracking-meta-wide text-muted-foreground">
							TV Shows
						</p>
						<p className="mt-1 font-mono text-micro uppercase tracking-meta text-muted-foreground">
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
