'use client'

import * as React from 'react'
import { Heart } from 'lucide-react'

import { useHasMounted } from '@/hooks/use-has-mounted'
import { useFavoritesStore } from '@/store/favoritesStore'
import { fetchDetailsTMDB } from '@/lib/api'
import type { Show } from '@/lib/types'
import MediaCard from '@/components/features/media/card/media-card'
import { cn } from '@/lib/utils'

interface FavoriteRef {
	id: number
	type: 'movie' | 'tv'
}

function toFavoriteRefs(favoriteMovies: any[], favoriteTV: any[]) {
	const refs: FavoriteRef[] = []

	for (const item of favoriteMovies) {
		if (typeof item?.id === 'number') refs.push({ id: item.id, type: 'movie' })
	}

	for (const item of favoriteTV) {
		if (typeof item?.id === 'number') refs.push({ id: item.id, type: 'tv' })
	}

	return refs
}

function toDisplayShow(item: any, type: 'movie' | 'tv'): Show | null {
	if (!item || typeof item !== 'object') return null

	const hasImage = Boolean(item.poster_path || item.backdrop_path)
	if (!hasImage) return null

	return { ...(item as Show), media_type: type }
}

export function LibraryFavoritesSynced() {
	const hasMounted = useHasMounted()
	const { favoriteMovies, favoriteTV } = useFavoritesStore()

	const favoriteRefs = React.useMemo(() => {
		return toFavoriteRefs(favoriteMovies, favoriteTV)
	}, [favoriteMovies, favoriteTV])

	const [favorites, setFavorites] = React.useState<Show[]>([])
	const [isLoading, setIsLoading] = React.useState(true)

	React.useEffect(() => {
		if (!hasMounted) return

		let isCancelled = false

		const load = async () => {
			if (favoriteRefs.length === 0) {
				setFavorites([])
				setIsLoading(false)
				return
			}

			setIsLoading(true)

			try {
				const uniqueKey = (ref: FavoriteRef) => `${ref.type}:${ref.id}`
				const seen = new Set<string>()
				const uniqueRefs: FavoriteRef[] = []

				for (const ref of favoriteRefs) {
					const key = uniqueKey(ref)
					if (seen.has(key)) continue
					seen.add(key)
					uniqueRefs.push(ref)
				}

				const results = await Promise.all(
					uniqueRefs.map(async (ref) => {
						const localSource = ref.type === 'movie'
							? favoriteMovies.find((item) => item?.id === ref.id)
							: favoriteTV.find((item) => item?.id === ref.id)

						const localShow = toDisplayShow(localSource, ref.type)
						if (localShow) return localShow

						try {
							const data = await fetchDetailsTMDB(String(ref.id), ref.type)
							return { ...(data as Show), media_type: ref.type }
						} catch (error) {
							console.error(`Failed to load favorite ${ref.type}:${ref.id}`, error)
							return null
						}
					})
				)

				const valid = results.filter((item): item is Show => Boolean(item))
				if (!isCancelled) setFavorites(valid)
			} finally {
				if (!isCancelled) setIsLoading(false)
			}
		}

		load()

		return () => {
			isCancelled = true
		}
	}, [hasMounted, favoriteRefs, favoriteMovies, favoriteTV])

	const movieFavorites = React.useMemo(() => {
		return favorites.filter((show) => show.media_type === 'movie')
	}, [favorites])

	const tvFavorites = React.useMemo(() => {
		return favorites.filter((show) => show.media_type === 'tv')
	}, [favorites])

	if (!hasMounted || isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center space-y-4">
					<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-muted-foreground text-sm">Loading favorites...</p>
				</div>
			</div>
		)
	}

	if (favorites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
					<Heart className="w-8 h-8 text-zinc-600" />
				</div>
				<h3 className="text-xl font-bold text-foreground">No favorites yet</h3>
				<p className="text-muted-foreground text-center max-w-md">
					Start adding shows and movies to your favorites by clicking the heart icon on any details page.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-10">
			<div>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground">Favorites</h2>
				<p className="text-sm text-muted-foreground mt-1">
					{favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
				</p>
			</div>

			{movieFavorites.length > 0 && (
				<div className="space-y-6">
					<div>
						<h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Movies</h3>
						<p className="text-sm text-muted-foreground">{movieFavorites.length} movies</p>
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
				<div className="space-y-6">
					<div>
						<h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">TV Shows</h3>
						<p className="text-sm text-muted-foreground">{tvFavorites.length} shows</p>
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

