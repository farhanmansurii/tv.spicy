/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import useTVShowStore from '@/store/recentsStore';
import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Episode, Show } from '@/lib/types';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';

const RecentlyWatched = () => {
  const hasMounted = useHasMounted();
  const { recentlyWatched, loadEpisodes, deleteRecentlyWatched } = useTVShowStore();

  useEffect(() => {
    loadEpisodes();
  }, []);

  function clearRecentlyWatched() {
    const store = useTVShowStore.getState();
    store.deleteRecentlyWatched();
  }

  const shows: Show[] = useMemo(() => {
    if (!hasMounted || recentlyWatched.length === 0) return [];

    return recentlyWatched
      .filter((ep: Episode) => ep.still_path)
      .map((ep: Episode) => ({
        id: Number(ep.tv_id) || ep.id,
        name: ep.show_name || ep.name,
        title: ep.show_name || ep.name,
        overview: ep.overview || '',
        backdrop_path: ep.still_path || '',
        poster_path: ep.still_path || '',
        media_type: 'tv',
        vote_average: ep.vote_average || 0,
        first_air_date: ep.air_date || '',
        release_date: ep.air_date || '',
      }));
  }, [hasMounted, recentlyWatched]);

  if (shows.length === 0) return null;

  return (
    <MediaRow
      text="Continue Watching"
      shows={shows}
      type="tv"
      isVertical={false}
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRecentlyWatched}
          className="text-muted-foreground hover:text-red-500 transition-colors gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear History</span>
        </Button>
      }
    />
  );
};

export default RecentlyWatched;
