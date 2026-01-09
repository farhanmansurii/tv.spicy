'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Bookmark, Heart, Loader2, Sparkles } from 'lucide-react';
import Container from '@/components/shared/containers/container';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { LibraryContinueWatching } from '@/components/features/watchlist/library-continue-watching';
import { LibraryWatchlist } from '@/components/features/watchlist/library-watchlist';
import { LibraryFavorites } from '@/components/features/watchlist/library-favorites';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
    const hasMounted = useHasMounted();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'continue');

    // Update tab when URL param changes
    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    if (!hasMounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-20">
            {/* Hero Section */}
            <div className="relative w-full overflow-hidden border-b border-white/5">
                <Container className="relative pt-12 md:pt-16 pb-8">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                                Library
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base mt-1.5">
                                Your personal collection of shows, movies, and favorites
                            </p>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="pt-4 md:pt-8 pb-8 md:pb-12">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-zinc-900/50 border border-white/10 rounded-2xl p-1.5 h-auto">
                        <TabsTrigger
                            value="continue"
                            className={cn(
                                "rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300",
                                "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg",
                                "data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white"
                            )}
                        >
                            <History className="w-4 h-4 mr-2 inline" />
                            <span className="hidden sm:inline">Continue Watching</span>
                            <span className="sm:hidden">Continue</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="watchlist"
                            className={cn(
                                "rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300",
                                "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg",
                                "data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white"
                            )}
                        >
                            <Bookmark className="w-4 h-4 mr-2 inline" />
                            <span className="hidden sm:inline">Watchlist</span>
                            <span className="sm:hidden">Saved</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="favorites"
                            className={cn(
                                "rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300",
                                "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg",
                                "data-[state=inactive]:text-zinc-400 data-[state=inactive]:hover:text-white"
                            )}
                        >
                            <Heart className="w-4 h-4 mr-2 inline" />
                            <span className="hidden sm:inline">Favorites</span>
                            <span className="sm:hidden">Liked</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Continue Watching Tab */}
                    <TabsContent value="continue" className="mt-10 md:mt-12">
                        <LibraryContinueWatching />
                    </TabsContent>

                    {/* Watchlist Tab */}
                    <TabsContent value="watchlist" className="mt-10 md:mt-12">
                        <LibraryWatchlist />
                    </TabsContent>

                    {/* Favorites Tab */}
                    <TabsContent value="favorites" className="mt-10 md:mt-12">
                        <LibraryFavorites />
                    </TabsContent>
                </Tabs>
            </Container>
        </div>
    );
}
