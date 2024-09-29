/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { Command } from "cmdk";
import { Loader2 } from "lucide-react";
import { searchShows } from "@/lib/utils";
import useSearchStore from "@/store/recentsSearchStore";
import { Show, Anime } from "@/lib/types";
import { fetchData } from "@/lib/anime-helpers";
import {
    CommandDialog,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
export const SearchCommandBox = ({ children, searchType='tvshow' }: { children: any, searchType: "tvshow" | "anime" }) => {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = useState("");
    const [query, setQuery] = useState("");
    const { recentlySearched, addToRecentlySearched } = useSearchStore();

    const { data: searchResults, isFetching, error } = useQuery({
        queryKey: ["search", query, searchType],
        queryFn: () => searchType === "tvshow"
            ? searchShows(query).then(results => ({
                ...results,
                results: results.results.filter((item: any) =>
                    item.media_type === "tv" || item.media_type === "movie"
                )
            }))
            : fetchData(`advanced-search?query=${query}`),
        enabled: query.trim().length > 0,
    });

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            setQuery(value.length >= 2 ? value : '');
        }, 500),
        []
    );

    const handleInputChange = (value: string) => {
        setInputValue(value);
        debouncedSearch(value);
    };

    const handleSelectShow = (show: Show | Anime) => {
        addToRecentlySearched(show);
        setOpen((open) => !open)
        setQuery('')
        setInputValue('')
    };

    const renderSearchResults = () => {
        if (isFetching) return <Command.Item>Loading <Loader2 className="w-4 h-4 animate-spin ml-1" /></Command.Item>;
        if (error) return <Command.Empty>Error: {(error as Error).message}</Command.Empty>;
        return (query ?
            <CommandGroup heading={`Search Results for ${query}`}>
                {searchResults?.results.map((item: any) => {
                    const show = {
                        id: item.id,
                        title: item.name || item.title || item.title?.userPreferred || item.title?.english,
                        type: item.media_type || 'anime',
                        date: null,
                    };

                    return (
                        <CommandItem key={show.id} onSelect={() => handleSelectShow(item)} value={show.title} className="flex items-center justify-center">
                            <Link href={`/${show.type}/${show.id}`} className="flex justify-between w-full">
                                <span>{show.title} {show.date && `(${show.date})`}</span>
                                <span className={`px-2 text-xs py-1 h-fit rounded ${show.type === "tv" ? "bg-primary/90" : show.type === "movie" ? "bg-secondary" : "bg-red-500"}`}>
                                    {show.type}
                                </span>
                            </Link>
                        </CommandItem>
                    );
                })}
            </CommandGroup> : <CommandGroup heading={'Previous Searches'}>
                {recentlySearched.map((item: any) => {
                    const show = {
                        id: item.id,
                        title: item.name || item.title || item.title?.userPreferred || item.title?.english,
                        type: item.media_type || 'anime',
                        date: (item.first_air_date || item.release_date || item.releaseDate)?.split("-")[0] || null,
                    };
                    return (
                        <CommandItem key={show.id} onSelect={() => handleSelectShow(item)} value={show.title} className="flex items-center justify-center">
                            <Link href={`/${show.type}/${show.id}`} className="flex justify-between w-full">
                                <span>{show.title} {show.date && `(${show.date})`}</span>
                                <span className={`px-2 text-xs py-1 h-fit rounded ${show.type === "tv" ? "bg-primary/90" : show.type === "movie" ? "bg-secondary" : "bg-red-500"}`}>
                                    {show.type === "tv" ? "TV" : show.type === "movie" ? "Movie" : "Anime"}
                                </span>
                            </Link>
                        </CommandItem>
                    );
                })}
            </CommandGroup>)
    };
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])
    return (
        <>
            <Command>
                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput onValueChange={handleInputChange} value={inputValue} placeholder={`Search For ${searchType==='anime'?"Anime":"Movies / TV show"}`} />
                    <CommandList>
                        {renderSearchResults()}
                    </CommandList>
                </CommandDialog >
                <div onClick={() => setOpen(true)} >{children}</div>
            </Command>
        </>
    );
};
