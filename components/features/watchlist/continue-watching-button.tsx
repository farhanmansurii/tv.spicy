'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { Episode } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Play,
    Plus,
    Check,
    Info,
    Share2,
    ThumbsUp,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueWatchingButtonProps {
    id: string | number;
    show: any;
    type: 'movie' | 'tv';
    isDetailsPage?: boolean;
}

// Like/ThumbsUp store utilities
const LIKED_ITEMS_KEY = 'likedItems';

const getLikedItems = (): number[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(LIKED_ITEMS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveLikedItems = (items: number[]): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(items));
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
    const [isLoading, setIsLoading] = useState(false);

    // Load episodes on mount
    useEffect(() => {
        loadEpisodes();
    }, [loadEpisodes]);

    // Check if item is liked
    useEffect(() => {
        const likedItems = getLikedItems();
        setIsLiked(likedItems.includes(Number(id)));
    }, [id]);

    // Memoize watchlist status
    const isAdded = useMemo(() => {
        return type === 'movie'
            ? watchlist.some((s) => s?.id === id)
            : tvwatchlist.some((s) => s?.id === id);
    }, [type, watchlist, tvwatchlist, id]);

    // Find most recent episode for this show
    const recent = useMemo(() => {
        return recentlyWatched
            .filter((ep: Episode) => ep.tv_id === id)
            .sort((a: Episode, b: Episode) => {
                if (b.season_number !== a.season_number) {
                    return b.season_number - a.season_number;
                }
                return b.episode_number - a.episode_number;
            })[0];
    }, [recentlyWatched, id]);

    // Handle add/remove from watchlist
    const handleAddOrRemove = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            if (isAdded) {
                type === 'movie'
                    ? removeFromWatchList(Number(id))
                    : removeFromTvWatchList(Number(id));
                toast.info('Removed from watchlist', {
                    description: `${show?.name || show?.title || 'Item'} has been removed from your watchlist.`
                });
            } else {
                type === 'movie' ? addToWatchlist(show) : addToTvWatchlist(show);
                toast.success('Added to watchlist', {
                    description: `${show?.name || show?.title || 'Item'} has been added to your watchlist.`
                });
            }
        } catch (error) {
            toast.error('Something went wrong', {
                description: 'Failed to update watchlist. Please try again.'
            });
        }
    }, [isAdded, type, id, show, addToWatchlist, addToTvWatchlist, removeFromWatchList, removeFromTvWatchList]);

    // Handle like/unlike
    const handleLike = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const likedItems = getLikedItems();
            const itemId = Number(id);

            if (isLiked) {
                const updated = likedItems.filter((item) => item !== itemId);
                saveLikedItems(updated);
                setIsLiked(false);
                toast.info('Removed from favorites', {
                    description: `${show?.name || show?.title || 'Item'} has been removed from your favorites.`
                });
            } else {
                const updated = [...likedItems, itemId];
                saveLikedItems(updated);
                setIsLiked(true);
                toast.success('Added to favorites', {
                    description: `${show?.name || show?.title || 'Item'} has been added to your favorites.`
                });
            }
        } catch (error) {
            toast.error('Something went wrong', {
                description: 'Failed to update favorites. Please try again.'
            });
        }
    }, [id, isLiked, show]);

    // Handle share
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
                toast.success('Shared successfully!');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(url);
                toast.success('Link copied!', {
                    description: 'The link has been copied to your clipboard.'
                });
            }
        } catch (error: any) {
            // User cancelled or error occurred
            if (error.name !== 'AbortError') {
                // Fallback: Copy to clipboard
                try {
                    await navigator.clipboard.writeText(url);
                    toast.success('Link copied!', {
                        description: 'The link has been copied to your clipboard.'
                    });
                } catch (clipboardError) {
                    toast.error('Failed to share', {
                        description: 'Unable to copy link. Please try again.'
                    });
                }
            }
        } finally {
            setIsSharing(false);
        }
    }, [id, type, show, isSharing]);

    // Handle play/resume
    const handlePlay = useCallback(async () => {
        setIsLoading(true);

        try {
            if (type === 'tv') {
                if (recent) {
                    // Navigate to the specific episode
                    const params = new URLSearchParams();
                    params.set('season', String(recent.season_number));
                    params.set('episode', String(recent.episode_number));
                    router.push(`/${type}/${id}?${params.toString()}`);
                } else {
                    // No recent episode, go to first season/episode
                    router.push(`/${type}/${id}?season=1&episode=1`);
                }
            } else {
                // For movies, navigate to details page which will play automatically
                router.push(`/${type}/${id}`);
            }
        } catch (error) {
            toast.error('Navigation failed', {
                description: 'Unable to navigate. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    }, [router, type, id, recent]);

    // Handle info button (non-details page only)
    const handleInfo = useCallback(() => {
        if (!isDetailsPage) {
            router.push(`/${type}/${id}`);
        }
    }, [router, type, id, isDetailsPage]);

    // Determine play button text and label
    const playButtonText = useMemo(() => {
        if (type === 'tv' && recent) {
            return `Resume S${recent.season_number}:E${recent.episode_number}`;
        }
        return 'Play Now';
    }, [type, recent]);

    const playButtonLabel = useMemo(() => {
        if (type === 'tv' && recent) {
            return `Resume Season ${recent.season_number} Episode ${recent.episode_number}`;
        }
        return 'Play Now';
    }, [type, recent]);

    return (
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
            {/* Play/Resume Button - Primary Action */}
            <button
                onClick={handlePlay}
                disabled={isLoading}
                className={cn(
                    "relative h-[42px] md:h-[50px] px-6 md:px-8 rounded-full",
                    "flex items-center justify-center gap-2.5 transition-all duration-300",
                    "bg-white text-black hover:bg-zinc-200 active:scale-95",
                    "group shadow-lg shadow-black/20",
                    "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-zinc-950",
                    "disabled:opacity-70 disabled:cursor-wait",
                    "min-w-[120px] md:min-w-[140px]"
                )}
                aria-label={playButtonLabel}
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                    <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current transition-transform group-hover:scale-110" />
                )}
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                    {isLoading ? 'Loading...' : playButtonText}
                </span>
            </button>

            {/* Add to Watchlist Button */}
            <button
                onClick={handleAddOrRemove}
                className={cn(
                    "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full",
                    "flex items-center justify-center transition-all duration-300",
                    "bg-white/10 hover:bg-white/15 active:scale-95",
                    "border border-white/5 backdrop-blur-xl text-white group",
                    "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-zinc-950",
                    isAdded && "bg-primary/20 border-primary/30 shadow-lg shadow-primary/10"
                )}
                aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
                title={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                {isAdded ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-primary transition-all duration-300" />
                ) : (
                    <Plus className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-90 duration-300" />
                )}
            </button>

            {/* Details Page Actions */}
            {isDetailsPage && (
                <div className="flex items-center gap-2.5">
                    {/* Like/ThumbsUp Button */}
                    <button
                        onClick={handleLike}
                        className={cn(
                            "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full",
                            "flex items-center justify-center transition-all duration-300",
                            "bg-white/5 hover:bg-white/10 active:scale-95",
                            "border border-white/5 backdrop-blur-xl group",
                            "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-zinc-950",
                            isLiked
                                ? "bg-primary/20 border-primary/30 text-white shadow-lg shadow-primary/10"
                                : "text-zinc-300 hover:text-white"
                        )}
                        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <ThumbsUp
                            className={cn(
                                "w-4 h-4 md:w-5 md:h-5 transition-all duration-300",
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
                            "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full",
                            "flex items-center justify-center transition-all duration-300",
                            "bg-white/5 hover:bg-white/10 active:scale-95",
                            "border border-white/5 backdrop-blur-xl",
                            "text-zinc-300 hover:text-white group",
                            "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-zinc-950",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5",
                            isSharing && "animate-pulse"
                        )}
                        aria-label="Share"
                        title="Share"
                        aria-busy={isSharing}
                    >
                        {isSharing ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        ) : (
                            <Share2 className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-105" />
                        )}
                    </button>
                </div>
            )}

            {/* Info Button (Non-Details Page) */}
            {!isDetailsPage && (
                <button
                    onClick={handleInfo}
                    className={cn(
                        "h-[42px] w-[42px] md:h-[50px] md:w-[50px] rounded-full",
                        "flex items-center justify-center transition-all duration-300",
                        "bg-white/5 hover:bg-white/10 active:scale-95",
                        "border border-white/5 backdrop-blur-xl",
                        "text-zinc-300 hover:text-white group",
                        "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
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
