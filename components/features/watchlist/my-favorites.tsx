'use client';

import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaRow from '@/components/features/media/row/media-row';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { toast } from 'sonner';
import { fetchDetailsTMDB } from '@/lib/api';
import { Show } from '@/lib/types';
import { useSession } from '@/lib/auth-client';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useUserFavorites } from '@/hooks/use-user-data';

function MyFavoritesComponent() {
    const hasMounted = useHasMounted();
    const { data: session } = useSession();
    const { favoriteMovies: dbFavoriteMovies, favoriteTV: dbFavoriteTV, loadFromDatabase } = useFavoritesStore();
    const { data: dbMovies = [], isLoading: loadingMovies } = useUserFavorites('movie');
    const { data: dbTV = [], isLoading: loadingTV } = useUserFavorites('tv');
    const [favorites, setFavorites] = useState<Show[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from database on mount if authenticated
    useEffect(() => {
        if (hasMounted && session?.user?.id) {
            loadFromDatabase()
                .then(() => setIsLoading(false))
                .catch(() => setIsLoading(false));
        } else if (hasMounted) {
            setIsLoading(false);
        }
    }, [hasMounted, session?.user?.id, loadFromDatabase]);

    // Fetch details for database favorites
    useEffect(() => {
        const fetchFavoritesDetails = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const allFavoriteIds = [
                    ...dbMovies.map((f: any) => ({ id: f.mediaId, type: 'movie' as const })),
                    ...dbTV.map((f: any) => ({ id: f.mediaId, type: 'tv' as const })),
                ];

                if (allFavoriteIds.length === 0) {
                    setFavorites([]);
                    setIsLoading(false);
                    return;
                }

                const promises = allFavoriteIds.map(async ({ id, type }) => {
                    try {
                        const data = await fetchDetailsTMDB(String(id), type);
                        return { ...data, media_type: type };
                    } catch (error) {
                        console.error(`Failed to fetch favorite ${id}:`, error);
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

        if (hasMounted && session?.user?.id && (dbMovies.length > 0 || dbTV.length > 0)) {
            fetchFavoritesDetails();
        } else if (hasMounted) {
            setIsLoading(false);
        }
    }, [hasMounted, session?.user?.id, dbMovies, dbTV]);

    const handleClearFavorites = useCallback(async () => {
        const { clearFavorites } = useFavoritesStore.getState();
        await clearFavorites();
        setFavorites([]);
        toast.success('Favorites cleared', {
            description: 'All favorites have been removed.'
        });
    }, []);

    // Group favorites by type with proper categorization
    const movieFavorites = useMemo(() => {
        return favorites.filter((item) => {
            return item.media_type === 'movie' || (!item.media_type && item.title); // Movies have title, TV shows have name
        });
    }, [favorites]);

    const tvFavorites = useMemo(() => {
        return favorites.filter((item) => {
            return item.media_type === 'tv' || (!item.media_type && item.name); // TV shows have name
        });
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

    if (favorites.length === 0 && !isLoading && hasMounted) {
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
                />
            )}

            {/* TV Favorites */}
            {tvFavorites.length > 0 && (
                <MediaRow
                    text="Favorite TV Shows"
                    shows={tvFavorites}
                    type="tv"
                    isVertical={false}
                />
            )}
        </div>
    );
}

export const MyFavorites = memo(MyFavoritesComponent);
MyFavorites.displayName = 'MyFavorites';
