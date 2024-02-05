"use client";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Search, Share } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import SearchBar from "../SearchBar";
import NavigationSidebar from "../container/NavigationSidebar";
import ThemeButton from "./ThemeButton";
import { fetchGenres } from "@/lib/utils";

export default function Navbar(props: { text?: string }) {
  const [movieGenre, setMovieGenre] = useState(null);
  const [tvGenre, setTvGenre] = useState(null);
  useEffect(() => {
    async function fetchGenre() {
      const [movieGenres, tvGenres] = await Promise.all([
        fetchGenres("movie"),
        fetchGenres("tv"),
      ]);
      setMovieGenre(movieGenres);
      setTvGenre(tvGenres);
    }
    fetchGenre();
  }, []);

  return (
    <nav className="w-full absolute top-0 z-10">
      <div className="flex text-xl w-[96%] mx-auto font-bold p-2 py-4 flex-row justify-between items-center ">
        <Link href="/">
          {props.text && (
            <Button size={"icon"} className="rounded-full aspect-square p-2">
              <CaretLeftIcon className="h-full w-full" />
            </Button>
          )}
        </Link>
        <div className="flex gap-3">
          <ThemeButton />
          <SearchBar />
          <Sheet>
            <SheetTrigger asChild>
              <Button size={"icon"} className="rounded-full aspect-square p-2">
                <HamburgerMenuIcon className="h-full w-full" />
              </Button>
            </SheetTrigger>
            <NavigationSidebar movieGenre={movieGenre} tvGenre={tvGenre} />
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
