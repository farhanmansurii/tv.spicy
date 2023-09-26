"use client";
import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CommandIcon, Search, SearchIcon } from "lucide-react";
import Link from "next/link";
import { DebouncedInput } from "./common/DebouncedInput";

export function SearchBar() {
  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);

  // Throttle the search by using a flag
  const searchInProgress = React.useRef(false);
  const handleSearch = async (searchTerm: string) => {
    if (searchInProgress.current) {
      return;
    }
  
    searchInProgress.current = true;
    try {
      // Your search logic here, e.g., fetching data based on searchTerm
      setResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      searchInProgress.current = false;
    }
  };
  
  // Remove the previous handleInputChange function
  
  const down = (e: React.KeyboardEvent) => {
    if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((open) => !open);
    }
  };

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    setResults([]);
    setTerm("");
  };
  return (
    <>
     
      <CommandDialog open={open} onOpenChange={toggleOpen}>
        {/* <DebouncedInput
          value={term}
          onChange={(value:any) => handleSearch(value)}
          placeholder="Search..."
          className="bg-primary rounded-full p-2.5"
        /> */}
        <CommandList className=" pb-1.5">
          {term.length > 0 ? (
            results.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <>
                <CommandSeparator />
                <CommandGroup
                  className=" "
                  heading="Top Results"
                ></CommandGroup>
              </>
            )
          ) : (
            ""
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
