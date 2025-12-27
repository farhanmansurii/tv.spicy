/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GalleryVerticalEnd, Grid, List, Sparkles, LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectTrigger, Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSeasonEpisodes } from '@/lib/api';
import { useEpisodeStore } from '@/store/episodeStore';
import { useEpisodeViewStore } from '@/store/episodeViewStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import { cn } from '@/lib/utils';
import { EpisodeCard } from '../card/episode-card';
import { EpisodeListRow } from '../card/episode-list-card';

const SeasonTabs = ({ seasons, showId, showData }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { view, setView } = useEpisodeViewStore();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const playerRef = useRef<HTMLDivElement>(null);

  // 1. STABLE STATE LOGIC
  const validSeasons = useMemo(() => seasons?.filter((s: any) => s.season_number > 0) || seasons || [], [seasons]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);

  // 2. DATA SYNC
  const { data: seasonData, isLoading, isError } = useQuery({
    queryKey: ['episodes', showId, activeSeason],
    queryFn: () => fetchSeasonEpisodes(showId, activeSeason as number),
    enabled: !!showId && activeSeason !== null,
  });

  const episodes = seasonData?.episodes;

  // 3. HYDRATION & INITIALIZATION
  useEffect(() => {
    const sParam = searchParams.get('season');
    const eParam = searchParams.get('episode');

    if (sParam) {
      setActiveSeason(parseInt(sParam));
    } else if (validSeasons.length > 0) {
      setActiveSeason(validSeasons[0].season_number);
    }
  }, [validSeasons, searchParams]);

  // 4. ACTION HANDLERS (Functional Fixes)
  const handleSeasonChange = (value: string) => {
    const sNum = Number(value);
    setActiveSeason(sNum);
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', value);
    params.delete('episode'); // Clean episode state on season change
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onEpisodeClick = useCallback((episode: any) => {
    setActiveEP(episode);

    // Smooth scroll only if player exists
    if (playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('season', String(episode.season_number));
    params.set('episode', String(episode.episode_number));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams, setActiveEP]);

  if (isError) return (
    <div className="flex flex-col items-center py-20 gap-4 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="font-bold">Failed to load episodes. Please try again.</p>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-10 md:gap-16">
      {/* PLAYER COMPONENT */}
      <div ref={playerRef} className="w-full bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <TVContainer
          key={`${activeEP?.id}-${activeSeason}`}
          showId={showId}
          getNextEp={() => {}}
        />
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={String(activeSeason)} onValueChange={handleSeasonChange}>
                <SelectTrigger className="h-10 w-40 bg-zinc-900 border-white/10 rounded-xl text-xs font-bold">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  {validSeasons.map((s: any) => (
                    <SelectItem key={s.season_number} value={String(s.season_number)}>
                      Season {s.season_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                {episodes?.length || 0} Chapters
              </span>
            </div>
          </div>

          <div className="flex items-center p-1 gap-1 bg-zinc-900 border border-white/10 rounded-full">
            {[
              { id: 'list', icon: List, label: 'Digest' },
              { id: 'grid', icon: LayoutDashboard, label: 'Archive' },
              { id: 'carousel', icon: GalleryVerticalEnd, label: 'Binge' },
            ].map((v) => (
              <Button
                key={v.id}
                variant="ghost"
                onClick={() => setView(v.id as any)}
                className={cn(
                  'h-8 px-4 rounded-full transition-all text-[10px] font-black uppercase tracking-wider',
                  view === v.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                )}
              >
                <v.icon className="w-3 h-3 mr-2" />
                {v.label}
              </Button>
            ))}
          </div>
        </div>

        {/* CONTENT RENDERER */}
        <div className={cn("min-h-[400px]", isLoading && "opacity-50 pointer-events-none")}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {view === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {episodes?.map((ep: any) => (
                    <EpisodeCard key={ep.id} episode={ep} active={activeEP?.id === ep.id} toggle={onEpisodeClick} />
                  ))}
                </div>
              )}
              {view === 'list' && (
                <div className="flex flex-col gap-3">
                  {episodes?.map((ep: any) => (
                    <EpisodeListRow key={ep.id} episode={ep} active={activeEP?.id === ep.id} toggle={onEpisodeClick} />
                  ))}
                </div>
              )}
              {view === 'carousel' && (
                <Carousel opts={{ align: 'start', dragFree: true }}>
                  <CarouselContent className="-ml-2 py-2">
                    {episodes?.map((ep: any) => (
                      <CarouselItem key={ep.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3">
                        <EpisodeCard episode={ep} active={activeEP?.id === ep.id} toggle={onEpisodeClick} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonTabs;
