"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";
import ThemeButton from "../ThemeButton";
import { usePathname } from "next/navigation";
import path from "path";
import { title } from "process";

const categories = [
  // { title: "Trending", path: "trending" },
  // { title: "Airing Today", path: "airing-today" },
  // { title: "On The Air", path: "on-the-air" },
  // { title: "Popular", path: "popular" },
  // { title: "Top Rated", path: "top-rated" },
  {
    title: "Movies",
    path: "movie",
  },
  {
    title: "TV",
    path: "tv",
  },
  {
    title: "Anime",
    path: "anime",
  },
];

export const Header = () => {
  const pathname = usePathname(); // Get the current pathname using your custom hook

  return (
    <div className="w-full sticky  top-2 z-40">
      <div className="w-[98%] my-2 rounded-full backdrop-blur-lg bg-background/50 mx-auto flex-row p-2 border-green-200 justify-between flex h-full items-center max-w-6xl px-4">
        <Link href="/" passHref>
          <Button variant={pathname === "/" ? "link" : "ghost"}>Home</Button>
        </Link>

        <div className="flex gap-2 items-center">
          {categories.map((category) => (
            <Link key={category.path} href={`/${category.path}`} passHref>
              <Button
                variant={pathname.includes(category.path) ? "link" : "ghost"}
              >
                {category.title}
              </Button>
            </Link>
          ))}
          <ThemeButton />
        </div>
      </div>
    </div>
  );
};
