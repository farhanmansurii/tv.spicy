'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'

import type { Show } from '@/lib/types'
import useWatchListStore from '@/store/watchlistStore'
import MediaCard from '@/components/features/media/card/media-card'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

export function LibraryWatchlist() {
	const hasMounted = useHasMounted()
	const { watchlist, tvwatchlist } = useWatchListStore()

	const filteredMovieWatchlist = React.useMemo(() => {
		return watchlist?.filter((show: Show) => show.poster_path || show.backdrop_path) || []
	}, [watchlist])

	const filteredTVWatchlist = React.useMemo(() => {
		return tvwatchlist?.filter((show: Show) => show.poster_path || show.backdrop_path) || []
	}, [tvwatchlist])

	const totalCount = filteredMovieWatchlist.length + filteredTVWatchlist.length

	if (!hasMounted) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center space-y-4">
					<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-muted-foreground text-sm">Loading...</p>
				</div>
			</div>
		)
	}

	if (totalCount === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
					<Bookmark className="w-8 h-8 text-zinc-600" />
				</div>
				<h3 className="text-xl font-bold text-foreground">Your watchlist is empty</h3>
				<p className="text-muted-foreground text-center max-w-md">
					Add shows and movies to your watchlist by clicking the bookmark icon on any details page.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-10">
			<div>
				<h2 className="text-2xl md:text-3xl font-bold text-foreground">My Watchlist</h2>
				<p className="text-sm text-muted-foreground mt-1">
					{totalCount} {totalCount === 1 ? 'item' : 'items'} saved
				</p>
			</div>

			{filteredMovieWatchlist.length > 0 && (
				<div className="space-y-6">
					<div>
						<h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Movies</h3>
						<p className="text-sm text-muted-foreground">
							{filteredMovieWatchlist.length} movies
						</p>
					</div>
					<div
						className={cn(
							'grid gap-4 md:gap-6',
							'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
						)}
					>
						{filteredMovieWatchlist.map((show, index) => (
							<MediaCard
								key={show.id}
								type="movie"
								show={show}
								index={index}
								isVertical
							/>
						))}
					</div>
				</div>
			)}

			{filteredTVWatchlist.length > 0 && (
				<div className="space-y-6">
					<div>
						<h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">TV Shows</h3>
						<p className="text-sm text-muted-foreground">{filteredTVWatchlist.length} shows</p>
					</div>
					<div
						className={cn(
							'grid gap-4 md:gap-6',
							'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
						)}
					>
						{filteredTVWatchlist.map((show, index) => (
							<MediaCard key={show.id} type="tv" show={show} index={index} isVertical />
						))}
					</div>
				</div>
			)}
		</div>
	)
}
