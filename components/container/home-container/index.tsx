/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Command, CommandDialog } from "cmdk";
import { searchShows } from "@/lib/utils";
import { fetchData } from "@/lib/anime-helpers";
import { debounce } from "lodash";
import { Anime, Show } from "@/lib/types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/common/header";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { Button } from "@/components/ui/button";
import { Loader2, XIcon } from "lucide-react";
import { Motiondiv } from "@/components/common/MotionDiv";
import useTitle from "@/lib/use-title";
import RecentlyWatchedTV from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import useRecentSearchStore from "@/store/recentsSearchStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type SearchResult = Show | Anime;
interface SearchState {
    recentlySearched: (Show | Anime)[];
    addToRecentlySearched: (show: Show | Anime) => void;
}
const useSearchStore = create(
    persist<SearchState>(
        (set) => ({
            recentlySearched: [],
            addToRecentlySearched: (show) => set((state) => ({
                recentlySearched: [show, ...state.recentlySearched.filter(s => s.id !== show.id)].slice(0, 10)
            })),
        }),
        {
            name: 'watvhstorage',
        }
    )
);

export default function HomeContainer() {
    const { title } = useTitle();

    const [query, setQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [searchType, setSearchType] = useState<"tvshow" | "anime">("tvshow");
    const { recentlySearched, addToRecentlySearched } = useSearchStore()
    console.log(`(logs) > recentlySearched: `, recentlySearched)
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
        <div className="mx-auto max-w-6xl space-y-4 px-4 lg:px-0">
            <Header />
            <StarsBackground />
            <ShootingStars />
            <div className="pt-10  w-full">
                <Motiondiv
                    className="text-xl lg:text-3xl text-left px-2 w-full  text-pretty mb-3"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    {title}
                </Motiondiv>
                <div>
                    <Motiondiv
                    className="text-xl lg:text-3xl text-left  w-full  text-pretty mb-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >


                    <Command className="max-w-xl bg-background h-fit duration-150 border ease-in-out  rounded-lg">
                    {/* <CommandDialog open> */}
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
                                    <SelectTrigger className=" w-full  lg:w-fit  ">
                                        <SelectValue className="px-2" placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="tvshow">TV / Movie</SelectItem>
                                            <SelectItem value="anime">Anime</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                                    <SelectTrigger className=" w-full lg:w-fit  ">
                                        <SelectValue placeholder="Sort by date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="desc">Newest First</SelectItem>
                                            <SelectItem value="asc">Oldest First</SelectItem>
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
                                        <CommandItem  onClick={() => addToRecentlySearched(show.obj as Show)} key={show.id} className="w-full px-5 py-2 border-b" value={show.title}>
                                            <Link href={`/${show.type}/${show?.id}`} className="flex justify-between flex-row w-full">
                                            <span className="">{show.title} {show.date && `(${show.date})`}</span>
                                                <span className={show.type.length > 2 ? "capitalize" : "uppercase"}>{show.type}</span>
                                            </Link>
                                        </CommandItem>
                                    ))
                                ) : query.trim().length > 0 ? (
                                    <Command.Empty>No results found</Command.Empty>
                                ) : null}
                            </AnimatePresence>
                        </CommandList>
                    {/* </CommandDialog> */}
                    </Command>
                      </Motiondiv>
                </div>
                <div className="mt-10 space-y-4 w-full">
                    <RecentlyWatchedTV />
                    <WatchList type="movie" />
                    <WatchList type="tv" />
                </div>
            </div>
        </div>
    );
}
