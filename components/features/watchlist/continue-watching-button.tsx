/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Episode, Show } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { useRouter } from 'next/navigation';
import { Play, Plus, Check, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-hook';
import { differenceInDays } from 'date-fns';

export default function ContinueWatchingButton({ id, show, type, isDetailsPage }: any) {
    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 768px)');
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
        .sort((a, b) => b.season_number - a.season_number || b.episode_number - a.episode_number)[0];

    const handlePlay = () => {
        if (recent && isDetailsPage) {
            setActiveEP(recent);
            router.push(`/${type}/${id}?season=${recent.season_number}&episode=${recent.episode_number}`);
        } else {
            router.push(`/${type}/${id}`);
        }
    };

    return (
        <div className="flex items-center w-fit h-[48px] md:h-[56px] bg-black/40 backdrop-blur-[40px] rounded-full border border-white/10 shadow-2xl p-1 md:p-1.5 overflow-hidden ring-1 ring-white/5">

            {/* 1. PLAY CORE (Primary Action) */}
            <button
                onClick={handlePlay}
                className="h-full flex items-center justify-center gap-2 md:gap-3 bg-white text-black rounded-full px-4 md:px-6 transition-all active:scale-95 shadow-lg"
            >
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <span className="text-[11px] md:text-[14px] font-black uppercase tracking-[0.1em] whitespace-nowrap">
                    {isMobile ? (recent ? "RESUME" : "PLAY") : (recent ? "RESUME EPISODE" : "PLAY NOW")}
                </span>
            </button>

            {/* 2. ADD SEGMENT (Iconic Glass) */}
            <button
                onClick={handleAddOrRemove}
                className="h-full aspect-square flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-90 relative group"
            >
                <div className="absolute left-0 h-1/2 w-px bg-white/10" />
                {isAdded ? <Check className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[3]" />}
            </button>

            {nextEpisode && (
                <div className="flex items-center gap-3 border-l border-white/10 ml-1 pl-4 pr-6 min-w-0">
                    <MonitorPlay className="w-4 h-4 md:w-5 md:h-5 text-white/20 shrink-0" />
                    <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">
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
