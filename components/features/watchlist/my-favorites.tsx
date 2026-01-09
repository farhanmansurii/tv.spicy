'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { toast } from 'sonner';
import { fetchDetailsTMDB } from '@/lib/api';
import { Show } from '@/lib/types';

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

const clearLikedItems = (): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(LIKED_ITEMS_KEY);
    } catch (error) {
        console.error('Error clearing liked items:', error);
    }
};

export function MyFavorites() {
    const hasMounted = useHasMounted();
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [favorites, setFavorites] = useState<Show[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (hasMounted) {
            const items = getLikedItems();
            setLikedIds(items);
        }
    }, [hasMounted]);

    // Fetch favorite items details
    useEffect(() => {
        const fetchFavorites = async () => {
            if (likedIds.length === 0) {
                setFavorites([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const promises = likedIds.map(async (id) => {
                    try {
                        // Try TV first, then movie
                        const data = await fetchDetailsTMDB(String(id), 'tv').catch(() =>
                            fetchDetailsTMDB(String(id), 'movie')
                        );
                        return data;
                    } catch (error) {
                        console.error(`Failed to fetch item ${id}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validFavorites = results.filter((item): item is Show => item !== null);
                setFavorites(validFavorites);
            } catch (error) {
                console.error('Error fetching favorites:', error);
                toast.error('Failed to load favorites', {
                    description: 'There was an error loading your favorites. Please try again.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (hasMounted && likedIds.length > 0) {
            fetchFavorites();
        } else if (hasMounted) {
            setIsLoading(false);
        }
    }, [likedIds, hasMounted]);

    const handleClearFavorites = () => {
        clearLikedItems();
        setLikedIds([]);
        setFavorites([]);
        toast.success('Favorites cleared', {
            description: 'All favorites have been removed.'
        });
    };

    // Group favorites by type
    const movieFavorites = useMemo(() => {
        return favorites.filter((item) => item.media_type === 'movie' || !item.media_type);
    }, [favorites]);

    const tvFavorites = useMemo(() => {
        return favorites.filter((item) => item.media_type === 'tv');
    }, [favorites]);

    if (!hasMounted || isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading favorites...</p>
                </div>
            </div>
        );
    }

    if (likedIds.length === 0 || favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No favorites yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    Start adding shows and movies to your favorites by clicking the heart icon on any details page.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with clear button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">My Favorites</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFavorites}
                    className="text-muted-foreground hover:text-red-500 transition-colors gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                </Button>
            </div>

            {/* Movie Favorites */}
            {movieFavorites.length > 0 && (
                <MediaRow
                    text="Favorite Movies"
                    shows={movieFavorites}
                    type="movie"
                    isVertical={false}
                    showRank={false}
                />
            )}

            {/* TV Favorites */}
            {tvFavorites.length > 0 && (
                <MediaRow
                    text="Favorite TV Shows"
                    shows={tvFavorites}
                    type="tv"
                    isVertical={false}
                    showRank={false}
                />
            )}
        </div>
    );
}
