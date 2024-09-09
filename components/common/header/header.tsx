"use client";
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { CatIcon, FilmIcon, SearchIcon, TvIcon } from "lucide-react";
import { usePathname } from "next/navigation";

const categories = [
  {
    title: 'Search',
    icon: <SearchIcon />,
    href: '/'
  },
  {
    title: "Movies",
    href: "/movie",
    icon: <FilmIcon />
  },
  {
    title: "TV",
    href: "/tv",
    icon: <TvIcon />
  },
  {
    title: "Anime",
    href: "/anime",
    icon: <CatIcon />
  },

];

export const Header = () => {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <FloatingDock
        desktopClassName="w-fit mx-auto mb-4"
        items={categories}
        activeItem={pathname}
      />
    </div>
  );
};
