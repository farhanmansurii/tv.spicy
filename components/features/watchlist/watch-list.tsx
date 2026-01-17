'use client';
import type { Show } from '@/lib/types';
import React, { useMemo, useState, useEffect, memo } from 'react';
import useWatchListStore from '@/store/watchlistStore';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { useSession } from '@/lib/auth-client';

function WatchListComponent({ type }: { type: string }) {
	const hasMounted = useHasMounted();
	const { data: session } = useSession();
	const { watchlist, tvwatchlist, initialize } = useWatchListStore();
	const [isLoading, setIsLoading] = useState(true);

	// Load from database on mount if authenticated
	useEffect(() => {
		if (hasMounted && session?.user?.id) {
			initialize()
				.then(() => setIsLoading(false))
				.catch(() => setIsLoading(false));
		} else if (hasMounted) {
			setIsLoading(false);
		}
	}, [hasMounted, session?.user?.id, initialize]);

	// Filter and ensure proper categorization
	const filteredMovieWatchlist = useMemo(() => {
		if (!watchlist) return [];
		return watchlist.filter((show) => {
			const hasImage = show.poster_path || show.backdrop_path;
			const isMovie = show.media_type === 'movie' || (!show.media_type && type === 'movie');
			return hasImage && isMovie;
		});
	}, [watchlist, type]);

	const filteredTVWatchlist = useMemo(() => {
		if (!tvwatchlist) return [];
		return tvwatchlist.filter((show) => {
			const hasImage = show.poster_path || show.backdrop_path;
			const isTV = show.media_type === 'tv' || (!show.media_type && type === 'tv');
			return hasImage && isTV;
		});
	}, [tvwatchlist, type]);

	// Show skeleton while loading or mounting
	if (!hasMounted || isLoading) {
		return <MediaLoader withHeader className="min-h-[280px]" />;
	}

	const hasMovieContent =
		(type === 'movie' || type === 'all') && filteredMovieWatchlist.length > 0;
	const hasTVContent = (type === 'tv' || type === 'all') && filteredTVWatchlist.length > 0;

	// If no content, return null (but only after loading is complete)
	if (!hasMovieContent && !hasTVContent) {
		return null;
	}

	return (
		<>
			{hasMovieContent && (
				<MediaRow
					isVertical={false}
					text="My Movies"
					shows={filteredMovieWatchlist as Show[]}
					type="movie"
				/>
			)}

			{hasTVContent && (
				<MediaRow
					isVertical={false}
					text="My Shows"
					shows={filteredTVWatchlist as Show[]}
					type="tv"
				/>
			)}
		</>
	);
}

export default memo(WatchListComponent);
