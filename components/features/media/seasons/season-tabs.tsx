/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GalleryVerticalEnd, Grid, List, AlertCircle, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SelectTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { SeasonTabsProps } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSeasonEpisodes } from '@/lib/tmdb-fetch-helper';
import { useEpisodeStore } from '@/store/episodeStore';
import { useEpisodeViewStore } from '@/store/episodeViewStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import CommonTitle from '@/components/shared/animated/common-title';
import { EpisodeListRow } from '../card/episode-list-card';
import { EpisodeCard } from '../card/episode-card';


/**
 * MAIN COMPONENT: SeasonTabs
 */
const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, showId, showData }) => {
  const searchParams = useSearchParams();
  const [activeSeason, setActiveSeason] = useState<number | null>(null);

  const { view, setView } = useEpisodeViewStore();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const episodePlayerRef = useRef<HTMLDivElement>(null);

  const validSeasons = useMemo(() => {
    if (!seasons || seasons.length === 0) return [];
    const filtered = seasons.filter((season: any) => season.season_number > 0);
    return filtered.length > 0 ? filtered : seasons;
  }, [seasons]);

  const getDefaultSeason = useCallback(() => {
    if (!validSeasons || validSeasons.length === 0) return null;
    const seasonOne = validSeasons.find((s: any) => s.season_number === 1);
    return seasonOne ? seasonOne.season_number : validSeasons[0]?.season_number ?? null;
  }, [validSeasons]);

  const { data: seasonData, isLoading, isError, refetch } = useQuery({
    queryKey: ['episodes', showId, activeSeason],
    queryFn: () => fetchSeasonEpisodes(showId, activeSeason as number),
    enabled: !!showId && activeSeason !== null,
  });

  const episodes = seasonData?.episodes;

  useEffect(() => {
    const seasonFromParams = searchParams.get('season');
    if (seasonFromParams) {
      const parsedSeason = parseInt(seasonFromParams);
      if (validSeasons.some((s: any) => s.season_number === parsedSeason)) {
        setActiveSeason(parsedSeason);
        return;
      }
    }
    if (validSeasons.length > 0) {
      setActiveSeason(getDefaultSeason());
    }
  }, [seasons, searchParams, validSeasons, getDefaultSeason]);

  const handleSeasonChange = (value: string) => {
    setActiveSeason(Number(value));
  };

  const handleEpisodeClick = (episode: any) => {
    setActiveEP(episode);
    if (episodePlayerRef.current) {
      episodePlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const params = new URLSearchParams(window.location.search);
    params.set('season', String(episode.season_number));
    params.set('episode', String(episode.episode_number));
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleNextEpisode = (season: any, episode: any) => {
    if (!episodes) return;
    const nextEpNum = parseInt(episode) + 1;
    const nextEpisode = episodes.find((ep: any) => ep.episode_number === nextEpNum);

    if (nextEpisode) {
      handleEpisodeClick(nextEpisode);
    } else {
      const currentIdx = validSeasons.findIndex(s => s.season_number === activeSeason);
      if (currentIdx < validSeasons.length - 1) {
        setActiveSeason(validSeasons[currentIdx + 1].season_number);
      }
    }
  };

  if (!seasons || seasons.length === 0) return (
    <div className="w-full max-w-4xl mx-auto my-12 p-8 border border-white/10 bg-white/5 flex flex-col items-center gap-4 rounded-3xl">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <CommonTitle text="No Seasons Available" variant="section" as="h2" className="text-white" />
    </div>
  );

  if (activeSeason === null) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-8 mx-auto">
      <div ref={episodePlayerRef}>
        <TVContainer
          key={`${activeEP?.season_number}-${activeEP?.episode_number}`}
          showId={showId}
          getNextEp={handleNextEpisode}
        />
      </div>

      <Carousel opts={{ dragFree: true }} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <Select defaultValue={String(activeSeason)} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-[180px] h-10 border-white/10 bg-white/5 text-white rounded-xl">
              <SelectValue>Season {activeSeason}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
              {validSeasons.map((s: any) => (
                <SelectItem key={s.season_number} value={String(s.season_number)}>
                  Season {s.season_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center p-1 gap-1 bg-white/5 border border-white/10 rounded-xl">
            {[
              { id: 'list', icon: List },
              { id: 'grid', icon: Grid },
              { id: 'carousel', icon: GalleryVerticalEnd },
            ].map((v) => (
              <Button
                key={v.id}
                size="sm"
                variant="ghost"
                onClick={() => setView(v.id as any)}
                className={cn('h-8 px-3 rounded-lg transition-all', view === v.id ? 'bg-white/10 text-white' : 'text-white/40')}
              >
                <v.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>

        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
          ) : view === 'list' ? (
            <div className="flex flex-col gap-2">
              {episodes?.map((ep: any) => (
                <EpisodeListRow key={ep.id} episode={ep} active={activeEP?.id === ep.id} toggle={handleEpisodeClick} />
              ))}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes?.map((ep: any) => (
                <EpisodeCard key={ep.id} episode={ep} active={activeEP?.id === ep.id} toggle={handleEpisodeClick} />
              ))}
            </div>
          ) : (
            <CarouselContent className="-ml-4">
              {episodes?.map((ep: any) => (
                <CarouselItem key={ep.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <EpisodeCard episode={ep} active={activeEP?.id === ep.id} toggle={handleEpisodeClick} />
                </CarouselItem>
              ))}
            </CarouselContent>
          )}
        </div>
      </Carousel>
    </div>
  );
};

export default SeasonTabs;
