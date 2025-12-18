/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Episode } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { useRouter } from 'next/navigation';
import { Play, Plus, Check, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import { differenceInDays } from 'date-fns';

export default function ContinueWatchingButton({ id, show, type, isDetailsPage }: any) {
    const router = useRouter();
    const isMobile = useMediaQuery();
    const [timeLeft, setTimeLeft] = useState<string>('');

    const { recentlyWatched, loadEpisodes } = useTVShowStore();
    const { setActiveEP } = useEpisodeStore();
    const { addToWatchlist, removeFromWatchList, addToTvWatchlist, removeFromTvWatchList, watchlist, tvwatchlist } = useWatchListStore();

    const nextEpisode = show.next_episode_to_air;

    useEffect(() => {
        loadEpisodes();
        if (nextEpisode?.air_date) {
            const now = new Date();
            const airDate = new Date(nextEpisode.air_date);
            const days = differenceInDays(airDate, now);
            setTimeLeft(days > 0 ? `${days}D` : 'TODAY');
        }
    }, [loadEpisodes, nextEpisode]);

    const isAdded = type === 'movie' ? watchlist.some((s) => s?.id === id) : tvwatchlist.some((s) => s?.id === id);

    const handleAddOrRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        isAdded ? (type === 'movie' ? removeFromWatchList(id) : removeFromTvWatchList(id)) : (type === 'movie' ? addToWatchlist(show) : addToTvWatchlist(show));
    };

    const recent = recentlyWatched
        .filter((ep: Episode) => ep.tv_id === id)
        .sort((a: Episode, b: Episode) => b.season_number - a.season_number || b.episode_number - a.episode_number)[0];

    const handlePlay = () => {
        if (recent && isDetailsPage) {
            setActiveEP(recent);
            router.push(`/${type}/${id}?season=${recent.season_number}&episode=${recent.episode_number}`);
        } else {
            router.push(`/${type}/${id}`);
        }
    };

    return (
        <div className={cn(
            "flex items-center w-fit h-[45px] md:h-[54px] transition-all duration-300",
            "bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 shadow-md p-1 md:p-1.5",
            "ring-1 ring-white/5"
        )}>

            <button
                onClick={handlePlay}
                className={cn(
                    "h-full flex items-center justify-center gap-2 md:gap-3 bg-white text-black rounded-full transition-all active:scale-95 shadow-xl",
                    "px-5 md:px-8",
                    "hover:bg-white/10"
                )}
            >
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <span className="text-[11px] md:text-[14px] font-black uppercase tracking-[0.1em] whitespace-nowrap">
                    {isMobile ? (recent ? "RESUME" : "PLAY") : (recent ? "RESUME EPISODE" : "PLAY NOW")}
                </span>
            </button>

            <button
                onClick={handleAddOrRemove}
                className="h-full px-4 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90 relative"
            >
                {isAdded ? (
                    <Check className="w-5 h-5 stroke-[3] text-green-500" />
                ) : (
                    <Plus className="w-5 h-5 stroke-[3]" />
                )}
            </button>

            {nextEpisode && (
                <div className={cn(
                    "items-center gap-3  ml-1 pl-4 pr-6 min-w-0 hidden sm:flex animate-in slide-in-from-left-4 duration-500",
                )}>
                    <MonitorPlay className="w-4 h-4 md:w-5 md:h-5 text-yellow-500/80 shrink-0" />
                    <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap">
                            NEXT • {timeLeft}
                        </span>
                        <span className="text-[10px] md:text-[13px] font-bold text-white uppercase tabular-nums truncate">
                            S{nextEpisode.season_number} E{nextEpisode.episode_number}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
