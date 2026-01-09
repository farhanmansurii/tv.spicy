/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import useTVShowStore from '@/store/recentsStore';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Episode } from '@/lib/types';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContinueWatchingCard } from './continue-watching-card';
import CommonTitle from '@/components/shared/animated/common-title';
import { ContinueWatchingLoader } from '@/components/shared/loaders/continue-watching-loader';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';

const RecentlyWatched = () => {
  const hasMounted = useHasMounted();
  const { recentlyWatched, loadEpisodes, deleteRecentlyWatched } = useTVShowStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEpisodes();
  }, []);

  // Simulate loading state to prevent layout shift
  useEffect(() => {
    if (hasMounted) {
      // Small delay to ensure store is hydrated
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hasMounted]);

  function clearRecentlyWatched() {
    const store = useTVShowStore.getState();
    store.deleteRecentlyWatched();
  }

  const episodes = useMemo(() => {
    if (!hasMounted || recentlyWatched.length === 0) return [];
    return recentlyWatched.filter((ep: Episode) => ep.still_path || ep.tv_id);
  }, [hasMounted, recentlyWatched]);

  // Show skeleton while loading
  if (!hasMounted || isLoading) {
    return <ContinueWatchingLoader />;
  }

  // Only return null after loading is complete
  if (episodes.length === 0) return null;

  return (
    <div className="w-full space-y-0 py-4 group/row overflow-visible">
      {/* Header */}
      <div className="flex items-end justify-between px-1 mb-4 md:mb-6">
        <CommonTitle
          text="Continue Watching"
          variant="small"
          as="h2"
          spacing="none"
          className="text-lg md:text-xl font-bold tracking-tight text-white/90"
        />
        <div className="flex items-center transition-all duration-300 ease-out" style={{ willChange: 'opacity, transform' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentlyWatched}
            className="text-muted-foreground hover:text-red-500 transition-colors gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear History</span>
          </Button>
        </div>
      </div>

      {/* Scrollable Carousel */}
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-4 md:-ml-6 overflow-visible cursor-grab active:cursor-grabbing">
          {episodes.map((episode: Episode, index: number) => (
            <CarouselItem
              key={`${episode.tv_id}-${episode.season_number}-${episode.episode_number}`}
              className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ContinueWatchingCard episode={episode} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="flex items-center justify-between mt-4 md:mt-6 px-1">
          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500">
            <CarouselPrevious
              className="static translate-y-0 h-8 w-8 bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white hover:text-black transition-all"
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <CarouselNext
              className="static translate-y-0 h-8 w-8 bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white hover:text-black transition-all"
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </Carousel>
    </div>
  );
};

export default RecentlyWatched;
