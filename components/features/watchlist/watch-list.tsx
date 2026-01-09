'use client';
import { Show } from '@/lib/types';
import React, { useMemo, useState, useEffect, memo } from 'react';
import useWatchListStore from '@/store/watchlistStore';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { useSession } from 'next-auth/react';

function WatchListComponent({ type }: { type: string }) {
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  const { watchlist, tvwatchlist, loadFromDatabase } = useWatchListStore();
  const [isLoading, setIsLoading] = useState(true);

  // Load from database on mount if authenticated
  useEffect(() => {
    if (hasMounted && session?.user?.id) {
      loadFromDatabase()
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    } else if (hasMounted) {
      setIsLoading(false);
    }
  }, [hasMounted, session?.user?.id, loadFromDatabase]);

  // Filter and ensure proper categorization
  const filteredMovieWatchlist = useMemo(() => {
    if (!watchlist) return [];
    return watchlist.filter((show: Show) => {
      const hasImage = show.poster_path || show.backdrop_path;
      const isMovie = show.media_type === 'movie' || (!show.media_type && type === 'movie');
      return hasImage && isMovie;
    });
  }, [watchlist, type]);

  const filteredTVWatchlist = useMemo(() => {
    if (!tvwatchlist) return [];
    return tvwatchlist.filter((show: Show) => {
      const hasImage = show.poster_path || show.backdrop_path;
      const isTV = show.media_type === 'tv' || (!show.media_type && type === 'tv');
      return hasImage && isTV;
    });
  }, [tvwatchlist, type]);

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

export default memo(WatchListComponent);
