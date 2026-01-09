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

  // Initialize active episode from URL params when episodes are loaded
  // Also handle high-intent navigation scroll (from Continue Watching)
  useEffect(() => {
    const sParam = searchParams.get('season');
    const eParam = searchParams.get('episode');

    if (episodes && eParam && sParam && parseInt(sParam) === activeSeason) {
      const episode = episodes.find(
        (ep: any) => ep.season_number === parseInt(sParam) && ep.episode_number === parseInt(eParam)
      );
      if (episode && activeEP?.id !== episode.id) {
        setActiveEP(episode);

        // High-intent navigation: scroll to player immediately
        // This handles Continue Watching card clicks
        if (playerRef.current && !hasInitializedRef.current) {
          setTimeout(() => {
            playerRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 300); // After page settles
        }
      }
    }
  }, [episodes, searchParams, activeSeason, activeEP, setActiveEP]);

  // 4. ACTION HANDLERS (Functional Fixes)
  const handleSeasonChange = (value: string) => {
    const sNum = Number(value);
    setActiveSeason(sNum);
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', value);
    params.delete('episode'); // Clean episode state on season change
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Track if user is browsing (already on page) vs navigating (new page load)
  const [isBrowsingContext, setIsBrowsingContext] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // After initial load, user is in browsing context
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Small delay to distinguish initial load from browsing
      setTimeout(() => setIsBrowsingContext(true), 1000);
    }
  }, []);

  const onEpisodeClick = useCallback((episode: any, event?: React.MouseEvent) => {
    // Immediate visual feedback
    if (event?.currentTarget) {
      const target = event.currentTarget as HTMLElement;
      target.style.transform = 'scale(0.98)';
      setTimeout(() => {
        target.style.transform = '';
      }, 150);
    }

    setActiveEP(episode);

    const params = new URLSearchParams(searchParams.toString());
    params.set('season', String(episode.season_number));
    params.set('episode', String(episode.episode_number));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Context-aware scrolling: Only scroll to player if browsing (low intent)
    // High-intent navigation (from Continue Watching) handled separately
    if (isBrowsingContext && playerRef.current) {
      // Single scroll: only to player, not to episode card
      setTimeout(() => {
        playerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
    // If not browsing context, let navigation handlers manage scroll
  }, [router, pathname, searchParams, setActiveEP, isBrowsingContext]);

  // Handle next episode navigation
  const handleNextEpisode = useCallback(() => {
    // First, try to get current episode from activeEP or URL params
    let currentEpisode = activeEP;

    if (!currentEpisode && episodes && episodes.length > 0) {
      const sParam = searchParams.get('season');
      const eParam = searchParams.get('episode');
      if (sParam && eParam) {
        currentEpisode = episodes.find(
          (ep: any) => ep.season_number === parseInt(sParam) && ep.episode_number === parseInt(eParam)
        );
      }
    }

    if (!currentEpisode || !episodes || episodes.length === 0) {
      return;
    }

    // TypeScript guard: currentEpisode is guaranteed to be non-null here
    const episode = currentEpisode;

    // Find current episode index
    const currentIndex = episodes.findIndex(
      (ep: any) => ep.id === episode.id ||
      (ep.season_number === episode.season_number && ep.episode_number === episode.episode_number)
    );

    if (currentIndex === -1) {
      return;
    }

    // Check if there's a next episode in the current season
    if (currentIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentIndex + 1];
      onEpisodeClick(nextEpisode);
      return;
    }

    // If at the end of current season, try to move to next season
    const currentSeasonIndex = validSeasons.findIndex(
      (s: any) => s.season_number === activeSeason
    );

    if (currentSeasonIndex < validSeasons.length - 1) {
      const nextSeason = validSeasons[currentSeasonIndex + 1];
      const params = new URLSearchParams(searchParams.toString());
      params.set('season', String(nextSeason.season_number));
      params.set('episode', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [activeEP, episodes, activeSeason, validSeasons, router, pathname, searchParams, onEpisodeClick]);

  // Scroll active episode into view when it changes (only for initial load with URL params)
  const activeEpisodeRef = useRef<HTMLDivElement>(null);
  const hasScrolledToEpisodeRef = useRef(false);

  useEffect(() => {
    const eParam = searchParams.get('episode');
    const sParam = searchParams.get('season');

    // Only scroll to episode on initial load with URL params (high-intent navigation)
    // Not when browsing episodes on the same page
    if (
      activeEP &&
      activeEpisodeRef.current &&
      eParam &&
      sParam &&
      !hasScrolledToEpisodeRef.current &&
      !isBrowsingContext
    ) {
      hasScrolledToEpisodeRef.current = true;
      // Delay to ensure DOM is ready and player has scrolled first
      setTimeout(() => {
        activeEpisodeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 600); // After player scroll completes
    }
  }, [activeEP, searchParams, isBrowsingContext]);

  if (isError) return (
    <div className="flex flex-col items-center py-20 gap-4 text-destructive">
      <AlertCircle className="w-8 h-8" />
      <p className="font-bold">Failed to load episodes. Please try again.</p>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-10 md:gap-16">
      {/* PLAYER COMPONENT */}
      <div ref={playerRef} className="w-full">
        <TVContainer
          key={`${activeEP?.id}-${activeSeason}`}
          showId={showId}
          getNextEp={handleNextEpisode}
        />
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="space-y-4">
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
                {episodes?.length || 0} Episodes
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle - Repositioned closer to content */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center p-1 gap-1 bg-zinc-900 border border-white/10 rounded-full">
            {[
              { id: 'list', icon: List, label: 'List View', tooltip: 'Compact list with episode details' },
              { id: 'grid', icon: LayoutDashboard, label: 'Grid View', tooltip: 'Visual grid with thumbnails' },
              { id: 'carousel', icon: GalleryVerticalEnd, label: 'Carousel', tooltip: 'Swipeable horizontal view' },
            ].map((v) => (
              <Button
                key={v.id}
                variant="ghost"
                onClick={() => setView(v.id as any)}
                className={cn(
                  'h-9 px-4 md:px-5 rounded-full transition-all text-[10px] md:text-[11px] font-black uppercase tracking-wider relative group',
                  view === v.id
                    ? 'bg-white text-black shadow-lg border-2 border-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
                title={v.tooltip}
                aria-pressed={view === v.id}
                aria-label={v.label}
              >
                <v.icon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                <span className="hidden sm:inline">{v.label}</span>
                {/* Tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-[9px] font-medium text-white bg-zinc-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-lg">
                  {v.tooltip}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* CONTENT RENDERER */}
        <div className={cn(isLoading ? "opacity-50 pointer-events-none min-h-[400px]" : "")}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {view === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {episodes?.map((ep: any) => (
                    <div
                      key={ep.id}
                      ref={activeEP?.id === ep.id ? activeEpisodeRef : null}
                    >
                      <EpisodeCard episode={ep} active={activeEP?.id === ep.id} toggle={onEpisodeClick} />
                    </div>
                  ))}
                </div>
              )}
              {view === 'list' && (
                <div className="flex flex-col gap-2">
                  {episodes?.map((ep: any) => (
                    <div
                      key={ep.id}
                      ref={activeEP?.id === ep.id ? activeEpisodeRef : null}
                    >
                      <EpisodeListRow episode={ep} active={activeEP?.id === ep.id} toggle={onEpisodeClick} />
                    </div>
                  ))}
                </div>
              )}
              {view === 'carousel' && (
                <Carousel opts={{ align: 'start', dragFree: true }}>
                  <CarouselContent className="-ml-2 py-2">
                    {episodes?.map((ep: any) => (
                      <CarouselItem key={ep.id} className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3">
                        <div ref={activeEP?.id === ep.id ? activeEpisodeRef : null}>
                          <EpisodeCard episode={ep} active={activeEP?.id === ep.id} toggle={onEpisodeClick} />
                        </div>
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
