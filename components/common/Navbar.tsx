"use client";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { CommandIcon, Search, Share, Tv } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import SearchBar from "../SearchBar";
import NavigationSidebar from "../container/NavigationSidebar";
import ThemeButton from "./ThemeButton";
import { fetchGenres } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/router";
const categories = [
  { title: "Trending", path: "trending" },
  { title: "Airing Today", path: "airing-today" },
  { title: "On The Air", path: "on-the-air" },
  { title: "Popular", path: "popular" },
  { title: "Top Rated", path: "top-rated" },
];
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
  const router = useRouter();
  return (
    <nav className="w-full  z-10">
      <div className="flex text-xl w-[96%] mx-auto font-bold p-2 py-4 flex-row justify-between items-center ">
        <Button> Back</Button>
        <Link href={"/"}>
          <Button className="w-fit whitespace-nowrap" variant={"link"}>
            WATVH-TV
          </Button>
        </Link>
        <div className="hidden md:flex gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="space-x-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="1em"
                    width="1em"
                  >
                    <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm.001 6c-.001 0-.001 0 0 0h-.466l-2.667-4H20l.001 4zM9.535 9L6.868 5h2.597l2.667 4H9.535zm5 0l-2.667-4h2.597l2.667 4h-2.597zM4 5h.465l2.667 4H4V5zm0 14v-8h16l.002 8H4z" />
                  </svg>
                  <p className="text-sm font-medium leading-none">Movies</p>
                </NavigationMenuTrigger>
                {/* <NavigationMenuContent>
                  <ul className="flex  flex-col  p-4 md:w-[250px]  lg:grid-cols-[.75fr_1fr]">
                    {categories.map((category: any, index: number) => (
                      <ListItem
                        key={index}
                        href={`/discover/${
                          category.path
                        }?type=movie&title=${encodeURIComponent(
                          category.title
                        )}`}
                        title={category.title}
                      ></ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent> */}
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="space-x-2">
                  {" "}
                  <Tv width={12} height={12} />
                  <p className="text-sm font-medium leading-none">TV</p>
                </NavigationMenuTrigger>
                <NavigationMenuContent></NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-end justify-end self-end w-full gap-2">
          <Link href={"/search"}>
            <Button
              variant="ghost"
              className="md:flex hidden w-full min-w-[200px] flex-1 border-muted border font-normal justify-between gap-2 pr-2 text-sm text-muted-foreground"
            >
              Search Anything
              <div className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <CommandIcon size={12} />
              </div>
            </Button>
          </Link>{" "}
        </div>
        <div className="flex gap-3">
          <ThemeButton />
          <SearchBar />
          <Sheet>
            <SheetTrigger asChild>
              <Button size={"icon"} className="rounded-full aspect-square p-2">
                <HamburgerMenuIcon className="h-full w-full" />
              </Button>
            </SheetTrigger>
            {/* <NavigationSidebar /> */}
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
