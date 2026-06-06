'use client'

import * as React from 'react'
import { BookmarkSimpleIcon } from '@phosphor-icons/react'

import type { Show as MediaShow } from '@/lib/types'
import useWatchListStore from '@/store/watchlistStore'
import MediaCard from '@/components/features/media/card/media-card'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { cn } from '@/lib/utils'

export function LibraryWatchlist() {
	const hasMounted = useHasMounted()
	const watchlist = useWatchListStore((s) => s.watchlist)
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist)

	const filteredMovieWatchlist = React.useMemo(() => {
		return watchlist?.filter((show) => show.poster_path || show.backdrop_path) || []
	}, [watchlist])

	const filteredTVWatchlist = React.useMemo(() => {
		return tvwatchlist?.filter((show) => show.poster_path || show.backdrop_path) || []
	}, [tvwatchlist])

	const totalCount = filteredMovieWatchlist.length + filteredTVWatchlist.length

	if (!hasMounted) {
		return null
	}

	if (totalCount === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="w-16 h-16 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex items-center justify-center">
					<BookmarkSimpleIcon size={28} className="text-muted-foreground/50" />
				</div>
				<h3 className="text-lg font-semibold text-foreground">Your watchlist is empty</h3>
				<p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
					Add shows and movies to your watchlist by clicking the bookmark icon on any details page.
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col space-y-8 md:space-y-10">
			{filteredMovieWatchlist.length > 0 && (
				<div className="space-y-4 md:space-y-5">
					<div>
						<p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">
							Movies
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{filteredMovieWatchlist.length} {filteredMovieWatchlist.length === 1 ? 'movie' : 'movies'}
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
								show={show as unknown as MediaShow}
								index={index}
								isVertical
							/>
						))}
					</div>
				</div>
			)}

			{filteredTVWatchlist.length > 0 && (
				<div className="space-y-4 md:space-y-5">
					<div>
						<p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">
							TV Shows
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{filteredTVWatchlist.length} {filteredTVWatchlist.length === 1 ? 'show' : 'shows'}
						</p>
					</div>
					<div
						className={cn(
							'grid gap-4 md:gap-6',
							'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
						)}
					>
						{filteredTVWatchlist.map((show, index) => (
							<MediaCard
								key={show.id}
								type="tv"
								show={show as unknown as MediaShow}
								index={index}
								isVertical
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
