/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Episode } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { useRouter } from 'next/navigation';
import {
    Play,
    Plus,
    Check,
    Share2,
    ThumbsUp,
    Clapperboard,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContinueWatchingButton({ id, show, type, isDetailsPage }: any) {
    const router = useRouter();
    const { recentlyWatched, loadEpisodes } = useTVShowStore();
    const { setActiveEP } = useEpisodeStore();
    const { addToWatchlist, removeFromWatchList, addToTvWatchlist, removeFromTvWatchList, watchlist, tvwatchlist } = useWatchListStore();

    useEffect(() => { loadEpisodes(); }, [loadEpisodes]);

    const isAdded = type === 'movie' ? watchlist.some((s) => s?.id === id) : tvwatchlist.some((s) => s?.id === id);

    const handleAddOrRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        isAdded ? (type === 'movie' ? removeFromWatchList(id) : removeFromTvWatchList(id)) : (type === 'movie' ? addToWatchlist(show) : addToTvWatchlist(show));
    };

    const recent = recentlyWatched
        .filter((ep: Episode) => ep.tv_id === id)
        .sort((a: Episode, b: Episode) => b.season_number - a.season_number || b.episode_number - a.episode_number)[0];

    return (
        <div className="flex justify-center lg:justify-start flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center bg-white/[0.08] backdrop-blur-2xl border border-white/5 rounded-full p-[3px] shadow-2xl">
                <button
                    onClick={() => router.push(`/${type}/${id}`)}
                    className="h-[42px] md:h-[48px] px-6 rounded-full bg-white text-black hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.18em] translate-y-[0.5px]">
                        {recent ? "Resume" : "Play Now"}
                    </span>
                </button>

                <button
                    onClick={handleAddOrRemove}
                    className="h-[42px] w-[42px] md:h-[48px] md:w-[48px] flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                    {isAdded ? <Check className="w-4 h-4 md:w-5 md:h-5 text-primary" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
            </div>
        </div>
    );
}
