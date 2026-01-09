'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchTMDB, fetchGenres, discoverMedia } from '@/lib/api';

import Container from '@/components/shared/containers/container';
import SectionWrapper from '@/components/shared/animated/section-layout';
import CommonTitle from '@/components/shared/animated/common-title';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search, X, SlidersHorizontal, ArrowUpDown,
    Film, Tv, LayoutGrid, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import MediaCard from '@/components/features/media/card/media-card';
import GridLoader from '@/components/shared/loaders/grid-loader';

import { Show } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'release_date.desc';

export default function SearchPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultQuery = searchParams.get('q') || '';

    const [inputValue, setInputValue] = useState(defaultQuery);
    const [query, setQuery] = useState(defaultQuery);
    const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('popularity.desc');

    // --- Data Queries ---
    const { data: genreData } = useQuery({
        queryKey: ['genres', mediaType],
        queryFn: () => fetchGenres(mediaType === 'tv' ? 'tv' : 'movie'),
    });

    const { data: searchResults, isFetching } = useQuery({
        queryKey: ['search', query, page],
        queryFn: () => searchTMDB(query, page),
        enabled: query.trim().length >= 2,
    });

    const { data: discoverResults, isFetching: isDiscovering } = useQuery({
        queryKey: ['discover', mediaType, sortBy, page],
        queryFn: () => discoverMedia({ type: mediaType === 'all' ? undefined : mediaType, sortBy, page }),
        enabled: query.trim().length < 2,
    });

    // --- Search Logic ---
    useEffect(() => {
        const debounce = setTimeout(() => {
            const trimmed = inputValue.trim();
            setQuery(trimmed);
            setPage(1);
            if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
        }, 500);
        return () => clearTimeout(debounce);
    }, [inputValue, router]);

    const results = query.length >= 2 ? searchResults?.results || [] : discoverResults?.results || [];
    const totalPages = query ? searchResults?.total_pages || 1 : discoverResults?.total_pages || 1;
    const isLoading = isFetching || isDiscovering;

    return (
        <div className="min-h-screen mt-40 overflow-x-hidden">
            <SectionWrapper spacing="large" className="pb-0">
                <Container>
                    <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto w-full">
                        <div className="space-y-2 items-center flex flex-col  justify-center">
                            <div className="text-white text-4xl md:text-5xl font-bold tracking-tight text-center align-center">Search Everything</div>
                            <p className="text-zinc-500 text-sm md:text-base font-medium max-w-lg mx-auto tracking-wide text-center">
                                Explore thousands of cinematic titles, curated series, and hidden gems in our archive.
                            </p>
                        </div>

                        <div className="relative w-full group px-2 md:px-0">
                            <div className="absolute -inset-1 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 rounded-[2rem]" />
                            <div className="relative flex items-center bg-zinc-900/40 border border-white/5 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2rem] h-12 md:h-16 px-4 md:px-6 shadow-2xl">
                                <Search className="w-5 h-5 text-zinc-600 mr-4 shrink-0" />
                                <Input
                                    placeholder="Type to search..."
                                    className="border-none bg-transparent text-base md:text-lg p-0 h-full focus-visible:ring-0 placeholder:text-zinc-800 text-white font-medium"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                {inputValue && (
                                    <Button variant="ghost" size="icon" className="rounded-full text-zinc-600 hover:text-white" onClick={() => setInputValue('')}>
                                        <X size={20} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </SectionWrapper>

            <div className="sticky top-4 z-40 mt-8 md:mt-12 px-4 md:px-0">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-zinc-900/60 backdrop-blur-2xl border border-white/[0.04] rounded-2xl shadow-2xl">
                        <div className="flex items-center p-1 bg-black/40 rounded-xl w-full md:w-auto ring-1 ring-white/5">
                            {[
                                { id: 'all', label: 'All', icon: LayoutGrid },
                                { id: 'movie', label: 'Movies', icon: Film },
                                { id: 'tv', label: 'Series', icon: Tv },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setMediaType(item.id as any)}
                                    className={cn(
                                        "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                                        mediaType === item.id ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    <item.icon size={12} />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                                <SelectTrigger className="w-full md:w-[150px] h-9 bg-black/20 border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                    <ArrowUpDown size={12} className="mr-2 text-primary" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 rounded-xl">
                                    <SelectItem value="popularity.desc">Trending</SelectItem>
                                    <SelectItem value="vote_average.desc">Rating</SelectItem>
                                    <SelectItem value="release_date.desc">Release</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="ghost"
                                className={cn(
                                    "h-9 rounded-xl gap-2 px-4 border border-white/5 text-[9px] font-black uppercase tracking-widest",
                                    showFilters ? "bg-white text-black" : "bg-black/20 text-zinc-500 hover:text-white"
                                )}
                            >
                                <SlidersHorizontal size={12} />
                                <span className="hidden sm:inline">Filters</span>
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <SectionWrapper spacing="medium">
                <Container>
                    {isLoading ? (
                        <GridLoader />
                    ) : results.length > 0 ? (
                        <div className="space-y-12 transition-all duration-500 ease-out" style={{ willChange: 'opacity, transform', animation: 'fadeInUp 0.5s ease-out forwards' }}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-10">
                                {results.map((show, index) => (
                                    <MediaCard key={show.id} show={show} index={index} type={show.media_type || 'tv'} isVertical={true} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 pt-10 border-t border-white/[0.03]">
                                    <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-[10px] font-black uppercase tracking-widest text-zinc-600"><ChevronLeft size={16}/></Button>
                                    <span className="text-[9px] font-black text-white/40 tracking-[0.4em]">PAGE {page} / {totalPages}</span>
                                    <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="text-[10px] font-black uppercase tracking-widest text-zinc-600"><ChevronRight size={16}/></Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center">
                            <div className="relative h-20 w-20 rounded-3xl bg-zinc-900/40 border border-white/5 flex items-center justify-center">
                                <Search className="w-8 h-8 text-zinc-800" />
                            </div>
                            <div className="space-y-1">
                                <CommonTitle text="No Archive Found" variant="small" spacing="none" />
                                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">Refine your search parameters</p>
                            </div>
                        </div>
                    )}
                </Container>
            </SectionWrapper>
        </div>
    );
}
