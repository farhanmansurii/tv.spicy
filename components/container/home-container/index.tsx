/* eslint-disable @next/next/no-img-element */
"use client";
import ShowCard from "@/components/common/Card";
import { PlaceholdersAndVanishInput } from "@/components/common/vanish-input";
import GridLoader from "@/components/loading/GridLoader";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/lib/anime-helpers";
import useTitle from "@/lib/use-title";
import { searchShows } from "@/lib/utils";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { AnimeShowCard } from "../anime-container.tsx/anime-show-card";
import WatchList from "@/components/common/WatchList";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import FlickeringGrid, { GlowingStarsBackgroundCard } from "@/components/ui/glowing-stars";
const placeholders = {
  tvshow: [
    "The Shawshank Redemption",
    "12 Angry Man",
    "Titanic",
    "The Dark Knight",
    "Inception",
    "Avengers: Endgame",
    "The Lord of the Rings",
    "Avatar",
    "The Godfather",
    "Forrest Gump",
    "The Empire Strikes Back",
    "Gladiator",
    "Spirited Away",
    "Mulholland Drive",
    "In the Mood for Love",
    "Brokeback Mountain",
    "Kingdom of the Planet of the Apes",
    "Hit Man",
    "Bad Boys: Ride or Die",
    "The Watchers",
    "Godzilla Minus One",
    "Furiosa: A Mad Max Saga",
    "Under Paris",
    "X-Men: The Animated Series",
    "BoJack Horseman",
    "The Flintstones",
    "Sacred Games",
    "Mirzapur",
    "Panchayat",
    "Special Ops",
    "Scam 1992: The Harshad Mehta Story",
    "The Matrix",
    "The Silence of the Lambs",
    "The Shining",
    "The Departed",
    "The Green Mile",
    "The Pianist",
    "The Lives of Others",
    "The Great Dictator",
    "The Prestige",
    "The Lion King",
  ],
  anime: [
    "Naruto",
    "Attack on Titan",
    "Death Note",
    "Demon Slayer: Kimetsu no Yaiba",
    "My Hero Academia",
    "Fullmetal Alchemist: Brotherhood",
    "Attack on Titan: The Final Season",
    "Jujutsu Kaisen",
    "Sword Art Online",
    "Black Clover",
    "One Piece",
    "Haikyuu!!",
    "Blue Exorcist",
    "Sword Art Online: Alicization",
    "The Rising of the Shield Hero",
    "Dragon Ball Z",
    "One Punch Man",
    "Tokyo Ghoul",
    "Fairy Tail",
    "Bleach",
    "Hunter x Hunter",
    "Soul Eater",
    "Noragami",
    "Parasyte",
    "Magi: The Labyrinth of Magic",
    "Seven Deadly Sins",
    "D.Gray-man",
    "Assassination Classroom",
    "Akame ga Kill!",
    "Nanatsu no Taizai",
    "Boruto: Naruto Next Generations",
    "Black Clover",
    "One Piece",
    "Haikyuu!!",
    "Blue Exorcist",
    "Sword Art Online: Alicization",
    "The Rising of the Shield Hero",
    "Dragon Ball Z",
    "One Punch Man",
    "Tokyo Ghoul",
    "Fairy Tail",
    "Bleach",
    "Hunter x Hunter",
    "Soul Eater",
    "Noragami",
    "Parasyte",
    "Magi: The Labyrinth of Magic",
    "Seven Deadly Sins",
    "D.Gray-man",
    "Assassination Classroom",
    "Akame ga Kill!",
    "Nanatsu no Taizai",
    "Boruto: Naruto Next Generations",
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
      <div className="flex  flex-col  max-w-3xl w-full px-4 mx-auto  justify-center  items-center ">
    <GlowingStarsBackgroundCard>
          <div className="  flex justify-end mt-10 flex-col">
            <h2 className="mb-3  text-2xl text-center sm:text-4xl font-bold  ">
              {title}
            </h2>
            <div className="w-full max-w-3xl items-center justify-center  flex mx-auto">
              <div className="flex w-[350px]    mx-auto my-4 ">
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
            {/* <div className="flex   w-full justify-center items-center">
              <div className="flex gap-4 jus h-full w-full justify-center items-center">

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
            </div> */}
          </div>
</GlowingStarsBackgroundCard>
        <div className="z-30  my-10 w-full    mx-auto   ">
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-3 md:gap-y-10">
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
          {searchResults?.results?.length < 1 && <div>No results found</div>}
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
