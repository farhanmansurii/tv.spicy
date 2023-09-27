"use client";
import React, { useState } from "react";
import { DebouncedInput } from "./common/DebouncedInput";
import { useSearchStore } from "@/store/searchStore";
import { searchShows } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { ButtonIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const searchStore = useSearchStore();
  async function searchShowsByQuery(value: string) {
    searchStore.setQuery(value);
    const shows = await searchShows(value);
    searchStore.setShows(shows.results);
  }

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
      <Button size="icon" onClick={() => toggle()} className="rounded-full p-2">
        <Search />
      </Button>
      <CommandDialog open={open} onOpenChange={toggle}>
        <DebouncedInput
          setQuery={searchStore.setQuery}
          setData={searchStore.setShows}
          value={searchStore.query}
          onChange={(value) => void searchShowsByQuery(value.toString())}
        />
        <CommandList>
          {searchStore.shows ? (
            <CommandGroup heading="Search Results">
              {searchStore.shows.map((show, index) => (
                <Link key={index} href={`/${show.media_type}/${show.id}`}>
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
                        show.media_type === "tv" ? "bg-primary" : "bg-white text-primary"
                      }`}
                      size="xs"
                    >
                      {show.media_type === "tv" ? "TV" : "Movie"}
                    </Button>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
