/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
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
  const today = new Date();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { addRecentlyWatched } = useTVShowStore();
  const searchParams = useSearchParams();
  const activeSeason = searchParams.get('season');
  const activeEpisode = searchParams.get('episode');

  const toggle = (episode: Episode, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!episode?.id) return;

    const isReleased = isBefore(new Date(episode.air_date), today);
    if (!isReleased) {
      toast({
        title: 'Coming Soon',
        description: `This episode airs on ${episode.air_date}`,
      });
      return;
    }

    const isCurrentlyActive = activeEP?.id === episode.id;

    if (!isCurrentlyActive) {
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
    (String(ep.season_number) === activeSeason &&
      String(ep.episode_number) === activeEpisode) ||
    activeEP?.id === ep.id;

  const hasEpisodes = episodes?.length > 0;

  const renderEmpty = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500 bg-[#121212]/50 border border-white/5 rounded-episode md:rounded-episode-md">
      <p className="text-sm font-bold tracking-widest uppercase">No episodes found</p>
    </div>
  );

  const renderCarousel = () => (
    <div className="w-full relative px-4 md:px-0">
      <Carousel className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Available Episodes</h3>
          <div className="flex items-center gap-2">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-ui md:rounded-ui-md bg-[#121212] border-white/5 hover:bg-zinc-800 text-white" />
            <CarouselNext className="static translate-y-0 h-10 w-10 rounded-ui md:rounded-ui-md bg-[#121212] border-white/5 hover:bg-zinc-800 text-white" />
          </div>
        </div>
        <CarouselContent className="-ml-4 pb-4">
          {hasEpisodes
            ? episodes.map((ep, index) => (
              <CarouselItem
                key={`${ep.season_number}-${ep.episode_number}-${index}`}
                className="pl-4 basis-[90%] sm:basis-1/2 lg:basis-1/3"
              >
                <EpisodeCard
                  episode={ep}
                  active={isEpisodeActive(ep)}
                  toggle={toggle}
                  view="carousel"
                />
              </CarouselItem>
            ))
            : renderEmpty()}
        </CarouselContent>
      </Carousel>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {hasEpisodes
        ? episodes.map((ep, index) => (
          <EpisodeCard
            key={`${ep.season_number}-${ep.episode_number}-${index}`}
            episode={ep}
            active={isEpisodeActive(ep)}
            toggle={toggle}
            view="grid"
          />
        ))
        : renderEmpty()}
    </div>
  );

  const renderList = () => (
    <div className="flex flex-col gap-4">
      {hasEpisodes
        ? episodes.map((ep, index) => (
          <EpisodeCard
            key={`${ep.season_number}-${ep.episode_number}-${index}`}
            episode={ep}
            active={isEpisodeActive(ep)}
            toggle={toggle}
            view="list"
          />
        ))
        : renderEmpty()}
    </div>
  );

  return (
    <div className="w-full pb-20">
      {view === 'grid' && renderGrid()}
      {view === 'list' && renderList()}
      {view === 'carousel' && renderCarousel()}
    </div>
  );
};
