"use client";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CommandIcon,
  Home,
  HomeIcon,
  LucideHome,
  Search,
  Tv,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import React, { useEffect, useState } from "react";
import { cn, fetchGenres } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import { Command, CommandInput } from "@/components/ui/command";
import ThemeButton from "../ThemeButton";
import NavigationSidebar from "@/components/container/NavigationSidebar";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
const categories = [
  { title: "Trending", path: "trending" },
  { title: "Airing Today", path: "airing-today" },
  { title: "On The Air", path: "on-the-air" },
  { title: "Popular", path: "popular" },
  { title: "Top Rated", path: "top-rated" },
];
export const Header = () => {
  const router = useRouter();
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
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 lg:px-0">
      <header className=" w-full items-center  my-1 flex">
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
                  <path d="M12.74 2.32a1 1 0 00-1.48 0l-9 10A1 1 0 003 14h2v7a1 1 0 001 1h12a1 1 0 001-1v-7h2a1 1 0 001-1 1 1 0 00-.26-.68z" />
                </svg>
                <p className="text-sm font-medium leading-none">Home</p>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex  flex-col  p-4 md:w-[300px]  lg:grid-cols-[.75fr_1fr]">
                  <ListItem>
                    <Link
                      href={"/"}
                      className="flex whitespace-nowrap items-center"
                    >
                      Home
                    </Link>
                  </ListItem>
                  <ListItem onClick={() => router.back()}>
                    <div className="flex whitespace-nowrap items-center">
                      Go Back
                      <ChevronLeft />
                    </div>
                  </ListItem>
                  <ListItem onClick={() => router.forward()}>
                    <div className="flex whitespace-nowrap items-center ">
                      Go Forward
                      <ChevronRight />
                    </div>
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
                <NavigationMenuContent>
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
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="space-x-2">
                  {" "}
                  <Tv width={12} height={12} />
                  <p className="text-sm font-medium leading-none">TV</p>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex  flex-col  p-4 md:w-[250px]  lg:grid-cols-[.75fr_1fr]">
                    {categories.map((category: any, index: number) => (
                      <ListItem
                        key={index}
                        href={`/discover/${
                          category.path
                        }?type=tv&title=${encodeURIComponent(category.title)}`}
                        title={category.title}
                      ></ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-end justify-end self-end w-full gap-2">
          <Link href={"/search"}>
            <Button
              variant="ghost"
              className="md:flex hidden bg-background w-full min-w-[200px] flex-1 border-muted border font-normal justify-between gap-2 pr-2 text-sm text-muted-foreground"
            >
              Search Anything
              <div className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <CommandIcon size={12} />
              </div>
            </Button>
          </Link>{" "}
          <Link className="md:hidden" href={"/search"}>
            <Button variant={"ghost"} className="w-fit">
              <Search className="p-1" />
            </Button>
          </Link>
          <ThemeButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"ghost"}>
                <HamburgerMenuIcon className="h-full w-full " />
              </Button>
            </SheetTrigger>
            <NavigationSidebar movieGenre={movieGenre} tvGenre={tvGenre} />
          </Sheet>
        </div>
      </header>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
