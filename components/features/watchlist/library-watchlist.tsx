'use client'

import * as React from 'react'
import { BookmarkSimpleIcon } from '@phosphor-icons/react'

import type { Show as MediaShow } from '@/lib/types'
import useWatchListStore from '@/store/watchlistStore'
import MediaCard from '@/components/features/media/card/media-card'
import { ReelEmptyState } from './reel-empty-state'
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
			<ReelEmptyState
				icon={<BookmarkSimpleIcon size={24} />}
				title="Nothing on the reel yet."
				caption="Save a film or series with its bookmark, and it will appear here."
			/>
		)
	}

	return (
		<div className="flex flex-col gap-8 md:gap-10">
			{filteredMovieWatchlist.length > 0 && (
				<div className="flex flex-col gap-4 md:gap-5">
					<div>
						<p className="font-mono text-micro font-medium uppercase tracking-meta-wide text-muted-foreground">
							Movies
						</p>
						<p className="mt-1 font-mono text-micro uppercase tracking-meta text-muted-foreground">
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
				<div className="flex flex-col gap-4 md:gap-5">
					<div>
						<p className="font-mono text-micro font-medium uppercase tracking-meta-wide text-muted-foreground">
							TV Shows
						</p>
						<p className="mt-1 font-mono text-micro uppercase tracking-meta text-muted-foreground">
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
