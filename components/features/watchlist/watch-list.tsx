'use client';
import { Show } from '@/lib/types';
import React, { useMemo, useState, useEffect } from 'react';
import useWatchListStore from '@/store/watchlistStore';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';

export default function WatchList({ type }: { type: string }) {
  const hasMounted = useHasMounted();
  const { watchlist, tvwatchlist } = useWatchListStore();
  const [isLoading, setIsLoading] = useState(true);

  // Filter out items without backdrop_path to ensure they render properly
  const filteredMovieWatchlist = useMemo(() =>
    watchlist?.filter((show: Show) => show.poster_path || show.backdrop_path) || [],
    [watchlist]
  );
  const filteredTVWatchlist = useMemo(() =>
    tvwatchlist?.filter((show: Show) => show.poster_path || show.backdrop_path) || [],
    [tvwatchlist]
  );

  // Simulate loading state to prevent layout shift
  useEffect(() => {
    if (hasMounted) {
      // Small delay to ensure store is hydrated
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasMounted]);

  // Show skeleton while loading or mounting
  if (!hasMounted || isLoading) {
    return <WatchlistLoader />;
  }

  const hasMovieContent = (type === 'movie' || type === 'all') && filteredMovieWatchlist.length > 0;
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
          shows={filteredMovieWatchlist}
          type="movie"
        />
      )}

      {hasTVContent && (
        <MediaRow
          isVertical={false}
          text="My Shows"
          shows={filteredTVWatchlist}
          type="tv"
        />
      )}
    </>
  );
}
