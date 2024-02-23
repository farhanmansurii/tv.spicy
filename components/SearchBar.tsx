"use client";
import React, { useState } from "react";
import { DebouncedInput } from "./common/DebouncedInput";
import { useSearchStore } from "@/store/searchStore";
import { searchShows } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Button } from "./ui/button";
import { Search, Share } from "lucide-react";
import Link from "next/link";
import useRecentSearchStore from "@/store/recentsSearchStore";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const searchStore = useSearchStore();
  const { searches, addToSearchList, clearSearchList, removeFromSearchList } =
    useRecentSearchStore();
  async function searchShowsByQuery(value: string) {
    searchStore.setQuery(value);
    if (value) searchStore.setLoading(true);
    if (value.length >= 3) {
      const shows = await searchShows(value);
      searchStore.setShows(shows.results);
      searchStore.setLoading(false);
    }
  }
  const handleAddToHistory = (ep: any) => {
    addToSearchList(ep);
  };
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const toggle = () => {
    setOpen((prev) => !prev);
    searchStore.setShows([]);
    searchStore.setQuery("");
  };

  return (
    <div>
      <Link as={"/search"} href={"/search"}>
        <Button size={"icon"} className="rounded-full aspect-square p-2">
          <Search className="h-full w-full" />
        </Button>
      </Link>
      <CommandDialog open={open} onOpenChange={toggle}>
        <DebouncedInput
          setQuery={searchStore.setQuery}
          setData={searchStore.setShows}
          value={searchStore.query}
          onChange={(value) => void searchShowsByQuery(value.toString())}
        />
        <CommandList>
          {searchStore.shows.length > 0 && searchStore.query.length > 3 ? (
            <CommandGroup heading="Search Results">
              {searchStore.shows.map((show, index) => (
                <Link
                  onClick={() => handleAddToHistory(show)}
                  key={index}
                  href={`/${show.media_type}/${show.id}`}
                >
                  <CommandItem
                    className=" flex my-2 cursor-pointer justify-between gap-2"
                    key={index}
                  >
                    <div className="flex items-center gap-2">
                      <div>{show.name || show.title}</div>
                      {show.release_date || show.first_air_date ? (
                        <Button className="border-0" size="xs">
                          {show.release_date?.split("-")[0] ||
                            show.first_air_date?.split("-")[0]}
                        </Button>
                      ) : null}
                    </div>
                    <Button
                      className={`border-0  ${
                        show.media_type === "tv"
                          ? "bg-primary"
                          : "bg-white text-primary"
                      }`}
                      size="xs"
                    >
                      {show.media_type === "tv" ? "TV" : "Movie"}
                    </Button>
                  </CommandItem>
                </Link>
              ))}
              {searchStore.loading && (
                <>
                  <CommandItem className=" flex my-2 bg-secondary animate-pulse cursor-pointer h-10 justify-between gap-2"></CommandItem>
                  <CommandItem className=" flex my-2 bg-secondary animate-pulse cursor-pointer h-10 justify-between gap-2"></CommandItem>
                  <CommandItem className=" flex my-2 bg-secondary animate-pulse cursor-pointer h-10 justify-between gap-2"></CommandItem>
                  <CommandItem className=" flex my-2 bg-secondary animate-pulse cursor-pointer h-10 justify-between gap-2"></CommandItem>
                  <CommandItem className=" flex my-2 bg-secondary animate-pulse cursor-pointer h-10 justify-between gap-2"></CommandItem>
                </>
              )}
              {searches.length > 0 && <CommandSeparator className="mb-3" />}
            </CommandGroup>
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {searches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {searches.map((result) => (
                <Link
                  key={result.id}
                  onClick={() => {
                    handleAddToHistory(result);
                    toggle();
                  }}
                  href={`/${result.media_type}/${result.id}`}
                >
                  <CommandItem
                    className=" flex my-2 cursor-pointer justify-between gap-2"
                    key={result.id}
                  >
                    <div className="flex items-center gap-2">
                      <div>{result.name || result.title}</div>
                      {result.release_date || result.first_air_date ? (
                        <Button className="border-0" size="xs">
                          {result.release_date?.split("-")[0] ||
                            result.first_air_date?.split("-")[0]}
                        </Button>
                      ) : null}
                    </div>
                    <Button
                      className={`border-0  ${
                        result.media_type === "tv"
                          ? "bg-primary"
                          : "bg-white text-primary"
                      }`}
                      size="xs"
                    >
                      {result.media_type === "tv" ? "TV" : "Movie"}
                    </Button>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
