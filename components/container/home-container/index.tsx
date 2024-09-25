/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Command } from "cmdk";
import { cn, searchShows } from "@/lib/utils";
import { fetchData } from "@/lib/anime-helpers";
import { debounce } from "lodash";
import { Anime, Show } from "@/lib/types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/common/header";
import { Loader2 } from "lucide-react";
import useTitle from "@/lib/use-title";
import RecentlyWatchedTV from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CommandItem, CommandList } from "@/components/ui/command";
import useSearchStore from "@/store/recentsSearchStore";
import RecentlySearchedTV from "@/components/common/RecentlySearched";


export default function HomeContainer() {
    const { title } = useTitle();

    const [query, setQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [searchType, setSearchType] = useState<"tvshow" | "anime">("tvshow");
    const { recentlySearched, addToRecentlySearched } = useSearchStore()
    const { data: searchResults, isFetching, error } = useQuery({
        queryKey: ["search", query, searchType],
        queryFn: async () => {
            if (searchType === "tvshow") {
                const results = await searchShows(query);
                return {
                    ...results,
                    results: results.results.filter((item: any) =>
                        item.media_type === "tv" || item.media_type === "movie"
                    )
                };
            } else {
                return fetchData(`advanced-search?query=${query}`);
            }
        },
        enabled: query.trim().length > 0,
    });
    const handleSelectShow = useCallback((show: Show | Anime) => {
        addToRecentlySearched(show);
        console.log('selected')
    }, [addToRecentlySearched]);
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            if (value.length >= 2) {
                setQuery(value);
            } else {
                setQuery('');
            }
        }, 500),
        []
    );

    const handleInputChange = (value: string) => {
        setInputValue(value);
        debouncedSearch(value);
    };

    const clearSearch = () => {
        setInputValue("");
        setQuery("");
    };

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);


    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const sortResults = (results: any[]) => {
        return results.sort((a, b) => {
            const dateA = new Date(a.first_air_date || a.release_date || a.releaseDate || 0);
            const dateB = new Date(b.first_air_date || b.release_date || b.releaseDate || 0);
            return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
    };
    const handleSearchResults = (results: any[]) => {
        const sortedResults = sortResults(results);
        return searchType === "tvshow"
            ? sortedResults.map((show: Show) => ({
                id: show.id,
                title: show.name || show.title,
                type: show.media_type,
                date: (show?.first_air_date || show?.release_date)?.split("-")[0] || null,
                obj: show
            }))
            : sortedResults.map((anime: Anime) => ({
                id: anime.id,
                title: anime.title.userPreferred || anime.title.english,
                date: anime.releaseDate,
                type: 'anime',
                obj: anime
            }));
    };
    return (
        <div className="via-background  to-background from-secondary bg-gradient-to-br -mt-4 -py-4">
            <div className="mx-auto  max-w-6xl space-y-4 px-4 lg:px-0">
                <Header />
                <div className="mx-auto w-[600px] max-w-full px-8 sm:px-0">
                    <div className="mt-24 space-y-16 text-center">
                        <div className="relative z-10 mb-16">
                            <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl mx-auto max-w-md">
                                {title}
                            </h1>
                        </div>
                        <div className="relative h-20 z-30">
                            <div style={{ minHeight: '57.9766px' }}>
                                <div style={{ transform: 'translateZ(0px)' }}>
                                    <div className="hover:flare-enabled group flex flex-col rounded-[28px] transition-colors sm:flex-row sm:items-center relative bg-search-background">
                                        <div
                                            className="flare-light pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-[400ms] rounded-[28px]"
                                            style={{
                                                backgroundImage: 'radial-gradient(circle at center, rgb(128, 0, 128), rgba(128, 0, 128, 0) 70%)',
                                                backgroundPosition: '50% 50%',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '400px 400px',
                                            }}
                                        >
                                            <div className="absolute inset-[1px] overflow-hidden rounded-[28px] transition-colors" style={{ backgroundColor: 'rgb(76, 29, 149)' }}>
                                                <div className="absolute inset-0 opacity-10" style={{
                                                    backgroundImage: 'linear-gradient(to bottom right, rgb(138, 43, 226), rgb(75, 0, 130))',
                                                    backgroundPosition: '50% 50%',
                                                    backgroundSize: '400px 400px',
                                                    backgroundRepeat: 'no-repeat'
                                                }}></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col relative">
                                            <div className="pointer-events-none absolute bottom-0 left-5 top-0 flex max-h-14 items-center text-search-icon">
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
                                                        <path fill="currentColor" d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <Command className="max-w-xl border bg-background h-fit py-2 duration-150  ease-in-out  rounded-2xl">
                                                    <div className="flex  lg:flex-row lg:items-center justify-between  flex-col pb-3 lg:pb-0 px-3">
                                                        <div className=" w-full mr-2 flex flex-row items-center">
                                                            <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                            <Command.Input
                                                                value={inputValue}
                                                                placeholder="Search for TV shows or anime..."
                                                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                                onValueChange={handleInputChange}
                                                            />

                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Select value={searchType} onValueChange={(value) => setSearchType(value as "tvshow" | "anime")}>
                                                                <SelectTrigger className="bg-primary rounded-lg w-full  lg:w-fit  lg:px-4 ">
                                                                    <SelectValue className="px-4 " placeholder="Select a type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectItem value="tvshow">TV / Movie</SelectItem>
                                                                        <SelectItem value="anime">Anime</SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>

                                                        </div>
                                                    </div>
                                                    <CommandList className="max-h-[300px]  overflow-y-auto overflow-x-hidden">
                                                        <AnimatePresence>
                                                            {isFetching ? (
                                                                <Command.Item className="w-full border-t text-center px-5 py-2 border-b flex flex-row items-center justify-center" >Loading <Loader2 className="w-4 h-4 animate-spin ml-1" /></Command.Item>
                                                            ) : error ? (
                                                                <Command.Empty>Error: {(error as Error).message}</Command.Empty>
                                                            ) : searchResults && searchResults.results.length > 0 ? (
                                                                handleSearchResults(searchResults.results).map((show) => (
                                                                    <CommandItem  onSelect={() => handleSelectShow(show.obj)} key={show.id} className="w-full px-5 py-2 border-b" value={show.title}>
                                                                        <Link href={`/${show.type}/${show?.id}`} className="flex justify-between text-left flex-row w-full">
                                                                            <span className="">{show.title} {show.date && `(${show.date})`}</span>
                                                                            <span className={cn(
                                                                                show.type?.length > 2 ? "capitalize" : "uppercase",
                                                                                "px-2 py-1 h-fit my-auto rounded",
                                                                                {
                                                                                    "bg-primary/90": show.type === "tv",
                                                                                    "bg-secondary": show.type === "movie",
                                                                                    "bg-red-500": show.type === "anime",
                                                                                    "bg-primary": !["tv", "movie", "anime"].includes(show.type)
                                                                                }
                                                                            )}>{show.type}</span>
                                                                        </Link>
                                                                    </CommandItem>
                                                                ))
                                                            ) : query.trim().length > 0 ? (
                                                                <Command.Empty>No results found</Command.Empty>
                                                            ) : null}
                                                        </AnimatePresence>
                                                    </CommandList>

                                                </Command>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-10  w-full">
                    <div className="mt-10 space-y-4 w-full">
                        {/* <RecentlySearchedTV/> */}
                        <RecentlyWatchedTV />
                        <WatchList type="movie" />
                        <WatchList type="tv" />
                    </div>
                </div>
            </div>
        </div>
    );
}
