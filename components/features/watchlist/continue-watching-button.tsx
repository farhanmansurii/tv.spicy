'use client';

import React, { useEffect, useState, useCallback } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { Episode } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { useRouter } from 'next/navigation';
import {
    Play,
    Plus,
    Check,
    Info,
    Share2,
    ThumbsUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueWatchingButtonProps {
    id: string | number;
    show: any;
    type: 'movie' | 'tv';
    isDetailsPage?: boolean;
}

// Simple toast notification utility
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 transform translate-y-0 opacity-0 ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white text-sm font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

// Like/ThumbsUp store (using localStorage)
const getLikedItems = (): number[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('likedItems');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLikedItems = (items: number[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('likedItems', JSON.stringify(items));
    } catch (error) {
        console.error('Error saving liked items:', error);
    }
};

export default function ContinueWatchingButton({
    id,
    show,
    type,
    isDetailsPage = false
}: ContinueWatchingButtonProps) {
    const router = useRouter();
    const { recentlyWatched, loadEpisodes } = useTVShowStore();
    const {
        addToWatchlist,
        removeFromWatchList,
        addToTvWatchlist,
        removeFromTvWatchList,
        watchlist,
        tvwatchlist
    } = useWatchListStore();

    const [isLiked, setIsLiked] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        loadEpisodes();
    }, [loadEpisodes]);

    // Check if item is liked
    useEffect(() => {
        const likedItems = getLikedItems();
        setIsLiked(likedItems.includes(Number(id)));
    }, [id]);

    const isAdded = type === 'movie'
        ? watchlist.some((s) => s?.id === id)
        : tvwatchlist.some((s) => s?.id === id);

    const handleAddOrRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAdded) {
            type === 'movie' ? removeFromWatchList(Number(id)) : removeFromTvWatchList(Number(id));
            showToast('Removed from watchlist', 'info');
        } else {
            type === 'movie' ? addToWatchlist(show) : addToTvWatchlist(show);
            showToast('Added to watchlist', 'success');
        }
    };

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const likedItems = getLikedItems();
        const itemId = Number(id);

        if (isLiked) {
            const updated = likedItems.filter((item) => item !== itemId);
            saveLikedItems(updated);
            setIsLiked(false);
            showToast('Removed from favorites', 'info');
        } else {
            const updated = [...likedItems, itemId];
            saveLikedItems(updated);
            setIsLiked(true);
            showToast('Added to favorites', 'success');
        }
    }, [id, isLiked]);

    const handleShare = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSharing) return;
        setIsSharing(true);

        const title = show?.name || show?.title || 'Media';
        const url = `${window.location.origin}/${type}/${id}`;
        const text = `Check out ${title} on ${window.location.hostname}`;

        try {
            // Try Web Share API first (mobile)
            if (navigator.share) {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                showToast('Shared successfully!', 'success');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard!', 'success');
            }
        } catch (error: any) {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
                // Fallback: Copy to clipboard
                try {
                    await navigator.clipboard.writeText(url);
                    showToast('Link copied to clipboard!', 'success');
                } catch (clipboardError) {
                    showToast('Failed to share', 'error');
                }
            }
        } finally {
            setIsSharing(false);
        }
    }, [id, type, show, isSharing]);

    const handlePlay = useCallback(() => {
        router.push(`/${type}/${id}`);
    }, [router, type, id]);

    const handleInfo = useCallback(() => {
        router.push(`/${type}/${id}`);
    }, [router, type, id]);

    const recent = recentlyWatched
        .filter((ep: Episode) => ep.tv_id === id)
        .sort((a: Episode, b: Episode) =>
            b.season_number - a.season_number || b.episode_number - a.episode_number
        )[0];

    return (
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
            {/* Play/Resume Button */}
            <button
                onClick={handlePlay}
                className={cn(
                    "h-[42px] md:h-[50px] px-6 md:px-8 rounded-full flex items-center justify-center gap-2.5 transition-all duration-500",
                    "bg-white text-black hover:bg-zinc-200 active:scale-95 group shadow-lg",
                    "focus:outline-none focus:ring-2 focus:ring-white/50"
                )}
                aria-label={recent ? `Resume Season ${recent.season_number} Episode ${recent.episode_number}` : 'Play Now'}
            >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current transition-transform group-hover:scale-110" />
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                    {recent ? `Resume S${recent.season_number}:E${recent.episode_number}` : "Play Now"}
                </span>
            </button>

            {/* Add to Watchlist Button */}
            <button
                onClick={handleAddOrRemove}
                className={cn(
                    "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full flex items-center justify-center transition-all duration-300",
                    "bg-white/10 hover:bg-white/15 border border-white/5 backdrop-blur-xl text-white group",
                    "focus:outline-none focus:ring-2 focus:ring-white/50",
                    isAdded && "bg-white/20 border-white/20"
                )}
                aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
                title={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                {isAdded ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-primary animate-in zoom-in duration-300" />
                ) : (
                    <Plus className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-90" />
                )}
            </button>

            {/* Details Page Actions */}
            {isDetailsPage && (
                <div className="flex items-center gap-2.5">
                    {/* Like/ThumbsUp Button */}
                    <button
                        onClick={handleLike}
                        className={cn(
                            "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full flex items-center justify-center transition-all duration-300",
                            "bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-xl group",
                            "focus:outline-none focus:ring-2 focus:ring-white/50",
                            isLiked
                                ? "bg-white/20 border-white/20 text-white"
                                : "text-zinc-300 hover:text-white"
                        )}
                        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <ThumbsUp
                            className={cn(
                                "w-4 h-4 md:w-5 md:h-5 transition-all",
                                isLiked
                                    ? "fill-current scale-110"
                                    : "group-hover:-translate-y-0.5"
                            )}
                        />
                    </button>

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className={cn(
                            "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full flex items-center justify-center transition-all duration-300",
                            "bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-xl text-zinc-300 hover:text-white",
                            "focus:outline-none focus:ring-2 focus:ring-white/50",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            isSharing && "animate-pulse"
                        )}
                        aria-label="Share"
                        title="Share"
                    >
                        <Share2 className={cn(
                            "w-4 h-4 md:w-5 md:h-5 transition-transform",
                            !isSharing && "group-hover:scale-105"
                        )} />
                    </button>
                </div>
            )}

            {/* Info Button (Non-Details Page) */}
            {!isDetailsPage && (
                <button
                    onClick={handleInfo}
                    className={cn(
                        "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-xl text-zinc-300 hover:text-white",
                        "focus:outline-none focus:ring-2 focus:ring-white/50 group"
                    )}
                    aria-label="View details"
                    title="View details"
                >
                    <Info className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-105" />
                </button>
            )}
        </div>
    );
}
