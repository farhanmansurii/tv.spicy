/* eslint-disable @next/next/no-img-element */
"use client";
import { BackgroundGradientAnimation } from "@/components/animated-common/background-gradient-animation";
import ShowCard from "@/components/common/Card";
import { PlaceholdersAndVanishInput } from "@/components/common/vanish-input";
import GridLoader from "@/components/loading/GridLoader";
import RowLoader from "@/components/loading/RowLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/lib/anime-helpers";
import { Anime, Show } from "@/lib/types";
import useTitle from "@/lib/use-title";
import { searchShows } from "@/lib/utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { set } from "date-fns";
import { ArrowRight, Filter, Settings, Settings2, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { AnimeShowCard } from "../anime-container.tsx/anime-show-card";
import WatchList from "@/components/common/WatchList";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
const placeholders = {
  tvshow: [
    "The Shawshank Redemption (1994)",
    "12 Angry Man (2000)",
    "Titanic (1997)",
    "The Dark Knight (2008)",
    "Inception (2010)",
    "Avengers: Endgame (2019)",
    "The Lord of the Rings (2001)",
    "Avatar (2009)",
    "The Godfather (1972)",
    "Forrest Gump (1994)",
    "The Empire Strikes Back (1980)",
    "Gladiator (2000)",
    "Spirited Away (2001)",
    "Mulholland Drive (2001)",
    "In the Mood for Love (2000)",
    "Brokeback Mountain (2005)",
    "Kingdom of the Planet of the Apes (2024)",
    "Hit Man (2007)",
    "Bad Boys: Ride or Die (2024)",
    "The Watchers (2020)",
    "Godzilla Minus One (2024)",
    "Furiosa: A Mad Max Saga (2024)",
    "Under Paris (2024)",
    "X-Men: The Animated Series (1992-1997)",
    "BoJack Horseman (2014-2020)",
    "The Flintstones (1960-1966)",
    "Sacred Games (2018-2019)",
    "Mirzapur (2018-2020)",
    "Panchayat (2020-present)",
    "Special Ops (2020)",
    "Scam 1992: The Harshad Mehta Story (2020)",
  ],
  anime: [
    "Naruto (2002-2007)",
    "Attack on Titan (2013-2023)",
    "Death Note (2006-2007)",
    "Demon Slayer: Kimetsu no Yaiba (2019-present)",
    "My Hero Academia (2016-present)",
    "Fullmetal Alchemist: Brotherhood (2009-2010)",
    "Attack on Titan: The Final Season (2020-2023)",
    "Jujutsu Kaisen (2020-present)",
    "Sword Art Online (2012-2017)",
    "Black Clover (2017-present)",
    "One Piece (1999-present)",
    "Haikyuu!! (2014-2020)",
    "Blue Exorcist (2011-2016)",
    "Sword Art Online: Alicization (2018-2019)",
    "The Rising of the Shield Hero (2019-present)",
  ],
};
export default function HomeContainer() {
  const { title } = useTitle();
  const [query, setQuery] = useState<string | null>("");
  const [filters, setFilters] = useState({
    visible: true,
    type: "tvshow",
  });
  const {
    data: searchResults,
    isLoading: searchResultsLoading,
    isError: searchResultsError,
    refetch,
  } = useQuery({
    queryKey: ["search"],
    queryFn: async () =>
      query &&
      (filters.type === "tvshow"
        ? await searchShows(query as any)
        : await fetchData(`advanced-search?query=${query}`)),
    enabled: false,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e?.preventDefault) e.preventDefault();
    if (!query) return;
    await refetch();
    setQuery(null);
  };
  const handlefilters = () => {
    setFilters({ ...filters, visible: !filters.visible });
  };
  const handleSelectType = (type: string) => {
    setQuery(null);
    refetch();
    filters.visible && setFilters({ ...filters, type });
  };
  return (
    title && (
      <div className="flex  flex-col  max-w-6xl w-full px-4 mx-auto  justify-center  items-center ">
        <div className=" h-[45vh] flex justify-end flex-col">
          <h2 className="mb-10  text-2xl text-center sm:text-4xl font-bold  ">
            {title}
          </h2>
          <div className="w-full max-w-2xl items-center justify-center mb-4 flex mx-auto">
            <div className="flex w-full ">
              <PlaceholdersAndVanishInput
                placeholders={
                  filters.type === "tvshow"
                    ? placeholders.tvshow
                    : placeholders.anime
                }
                onChange={handleChange}
                onSubmit={onSubmit}
              />

              {/* <button
              // onClick={handlefilters}
              style={{ aspectRatio: "1/1" }}
              className="  hover:scale-95  duration-150  z-30 rounded-full w-10 h-10  m-1 bg-muted "
            >
              <Settings2 className="p-2  w-full h-full" />
            </button> */}
              {searchResults && searchResults?.results?.length > 0 && (
                <Button
                  size={"icon"}
                  className="  hover:scale-95 duration-150  z-30 rounded-full   m-1 bg-muted "
                  onClick={() => {
                    setQuery(null);
                    refetch();
                  }}
                >
                  <X className="p-2 w-full h-full" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex h-16  w-full justify-center items-center">
            <div className="flex gap-4 jus h-full w-full justify-center items-center">
              {/* <div>{!filters.visible ? "Discover" : "Search for "}</div> */}
              <div className="flex gap-4"></div>
              <ToggleGroup value={filters.type} type="single">
                <ToggleGroupItem
                  disabled
                  value="null"
                  onClick={() => {
                    handleSelectType("tvshow");
                  }}
                >
                  Search For
                </ToggleGroupItem>
                <ToggleGroupItem
                  variant={"outline"}
                  value="tvshow"
                  onClick={() => {
                    handleSelectType("tvshow");
                  }}
                >
                  TV/Movies
                </ToggleGroupItem>
                <ToggleGroupItem
                  variant={"outline"}
                  value="anime"
                  onClick={() => {
                    handleSelectType("anime");
                  }}
                >
                  Anime
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
        <div className="z-30  my-10 w-full    mx-auto   ">
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 md:gap-y-10">
            {searchResults &&
              searchResults.results.map((show: any, index: number) =>
                filters.type === "tvshow" ? (
                  show?.backdrop_path && (
                    <ShowCard
                      key={index}
                      showRank={false}
                      variants={""}
                      show={show}
                      type={show.media_type}
                      index={index}
                      isVertical={true}
                    />
                  )
                ) : (
                  <AnimeShowCard key={index} anime={show} />
                )
              )}
          </div>
          {searchResults?.length < 1 && <div>No results found</div>}
          {searchResultsLoading && <GridLoader />}
          {!query && !searchResults && (
            <div className="space-y-10 ">
              <RecentlyWatched />
              <WatchList type="all" />
            </div>
          )}
        </div>
      </div>
    )
  );
}

interface FilterItemProps {
  src: string;
  label: string;
  onClick?: () => void;
  link?: any;
  active?: boolean;
}

const FilterItem: React.FC<FilterItemProps> = ({
  src,
  label,
  onClick,
  link,
  active,
}) => {
  const itemClasses = `px-4 gap-2 text-sm md:text-md border-2 hover:scale-95 group  backdrop-blur-sm mx-auto flex justify-center items-center hover:bg-muted-foreground/20 duration-150 rounded-2xl text-center h-12 md:h-16 cursor-pointer ${
    active
      ? " hover:bg-primary/70 text-background bg-primary "
      : "border-foreground/20 bg-muted/40 text-primary-background"
  }`;

  const content = (
    <div className="whitespace-nowrap flex items-center gap-2">
      <img alt="" className="w-10 h-10 hidden md:block" src={src} />
      {label}
    </div>
  );

  return (
    <div className={itemClasses} onClick={onClick}>
      {link ? (
        <Link href={link} className="flex justify-center items-center gap-2">
          {content}
        </Link>
      ) : (
        content
      )}
      {active && (
        <X className=" w-6 h-6 p-1  md:p-2 md:w-8 md:h-8  rounded-full bg-primary " />
      )}
      {link && (
        <ArrowTopRightIcon className="w-8 group-hover:rotate-0 rotate-45 duration-200 h-8  rounded-full bg-primary p-2" />
      )}
    </div>
  );
};
