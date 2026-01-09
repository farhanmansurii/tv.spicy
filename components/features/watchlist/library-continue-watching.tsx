'use client';

import React, { useEffect, useMemo } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { Button } from '@/components/ui/button';
import { Trash2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { Episode } from '@/lib/types';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContinueWatchingCard } from './continue-watching-card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';

export function LibraryContinueWatching() {
    const hasMounted = useHasMounted();
    const { recentlyWatched, loadEpisodes, deleteRecentlyWatched } = useTVShowStore();

    useEffect(() => {
        loadEpisodes();
    }, [loadEpisodes]);

    function clearRecentlyWatched() {
        const store = useTVShowStore.getState();
        store.deleteRecentlyWatched();
    }

    const episodes = useMemo(() => {
        if (!hasMounted || recentlyWatched.length === 0) return [];
        return recentlyWatched.filter((ep: Episode) => ep.still_path || ep.tv_id);
    }, [hasMounted, recentlyWatched]);

    if (!hasMounted) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (episodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No recent activity</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    Start watching shows and movies to see them here. Your progress will be saved automatically.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Continue Watching</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {episodes.length} {episodes.length === 1 ? 'show' : 'shows'} in progress
                    </p>
                </div>
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

            {/* Scrollable Carousel */}
            <Carousel
                opts={{
                    align: 'start',
                    dragFree: true,
                    containScroll: 'trimSnaps',
                }}
                className="w-full relative group/row"
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
}
