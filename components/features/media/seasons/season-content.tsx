'use client';

import React, { useMemo } from 'react';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import {
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Carousel,
} from '@/components/ui/carousel';
import { isBefore } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { Episode, Show } from '@/lib/types';
import { EpisodeCard } from '@/components/features/media/card/episode-card';

interface SeasonContentProps {
  episodes: Episode[];
  showId: string;
  view: 'grid' | 'list' | 'carousel';
  onEpisodeSelectScroll: () => void;
  showData: Show;
}

export const SeasonContent: React.FC<SeasonContentProps> = ({
  episodes,
  showId,
  view,
  onEpisodeSelectScroll,
  showData,
}) => {
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { addRecentlyWatched } = useTVShowStore();
  const searchParams = useSearchParams();

  const activeSeason = searchParams.get('season');
  const activeEpisode = searchParams.get('episode');

  const toggle = (episode: Episode, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!episode?.id) return;

    if (!isBefore(new Date(episode.air_date), new Date())) {
      toast({ title: 'Coming Soon', description: `Airs on ${episode.air_date}` });
      return;
    }

    if (activeEP?.id !== episode.id) {
      setActiveEP(episode);
      const params = new URLSearchParams(window.location.search);
      params.set('season', String(episode.season_number));
      params.set('episode', String(episode.episode_number));
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

      addRecentlyWatched({
        ...episode,
        tv_id: showId,
        time: 0,
        still_path: episode.still_path || showData.backdrop_path,
        show_name: showData?.title,
      });
    }
    onEpisodeSelectScroll();
  };

  const isEpisodeActive = (ep: Episode) =>
    (String(ep.season_number) === activeSeason && String(ep.episode_number) === activeEpisode) ||
    activeEP?.id === ep.id;

  if (!episodes?.length) return (
    <div className="w-full py-20 flex flex-col items-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">No Episodes Released</p>
    </div>
  );

  return (
    <div className="w-full lg:pb-20 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {view === 'carousel' && (
        <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Season Episodes</h3>
            <div className="flex gap-2">
              <CarouselPrevious className="static h-9 w-9 border-white/10 bg-zinc-900 hover:bg-white hover:text-black transition-colors" />
              <CarouselNext className="static h-9 w-9 border-white/10 bg-zinc-900 hover:bg-white hover:text-black transition-colors" />
            </div>
          </div>
          <CarouselContent className="-ml-4">
            {episodes.map((ep) => (
              <CarouselItem key={ep.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <EpisodeCard episode={ep} active={isEpisodeActive(ep)} toggle={toggle} view="carousel" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} active={isEpisodeActive(ep)} toggle={toggle} view="grid" />
          ))}
        </div>
      )}

      {view === 'list' && (
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} active={isEpisodeActive(ep)} toggle={toggle} view="list" />
          ))}
        </div>
      )}
    </div>
  );
};
