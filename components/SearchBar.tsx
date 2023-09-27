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
  const [open, setOpen] = useState(false)
  const searchStore = useSearchStore();
  async function searchShowsByQuery(value: string) {
    searchStore.setQuery(value);
    const shows = await searchShows(value);
    console.log(shows.results);
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
  return (
    <div>
     <Button size='icon' onClick={()=>setOpen(true)} className="rounded-full p-2"><Search/></Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DebouncedInput
          setQuery={searchStore.setQuery}
          setData={searchStore.setShows}
          value={searchStore.query}
          onChange={(value) => void searchShowsByQuery(value.toString())}
        />
        <CommandList>
          {searchStore.shows? (
            <CommandGroup heading="Search Results">
              {searchStore.shows.map((show, index) => (
               <Link key={index} href={`/movie/${show.id}`} >
               <CommandItem className="border" key={index}>{show.name}</CommandItem>
               </Link>
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {/* <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup> */}
        </CommandList>
      </CommandDialog>
    
    </div>
  );
}
