"use client";
import React, { useState } from "react"; // Import React if not already imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SeasonContent } from "./SeasonContent";
import { useEpisodeStore } from "@/store/episodeStore";
import {
  ChevronRight,
  GalleryVerticalEnd,
  Grid,
  List,
  Menu,
  Play,
} from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

import {
  SelectTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Carousel, CarouselContent } from "../ui/carousel";
import { Toggle } from "../ui/toggle";
import EpisodeCard from "../common/EpisodeCard";
import { SeasonTabsProps } from "@/lib/types";
import { useSearchParams } from "next/navigation";
const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, id, tv_id }) => {
  const searchParams = useSearchParams();

  const [activeSeason, setActiveSeason] = useState<number>(
    parseInt(searchParams.get("season") || String(seasons[0]?.season))
  );

  const [view, setView] = useState<"grid" | "list" | "carousel">("carousel");
  return activeSeason ? (
    <div className="w-full flex flex-col mx-auto">
      <Carousel
        opts={{ dragFree: true }}
        className=" w-full justify-between mx-auto  "
      >
        <div className="flex font-bold  justify-between  items-center    text-xl md:text-2xl   py-2 flex-row">
          <Select
            defaultValue={"1"}
            onValueChange={(value) => setActiveSeason(Number(value))}
          >
            <SelectTrigger className="   w-fit">
              <SelectValue className="">
                <div className="pr-10">{`Season ${activeSeason}`}</div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {seasons?.map((season: any) => (
                <SelectItem value={season.season} key={season.season}>
                  <div className="mx-1 flex gap-2">Season {season.season}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={view === "list" ? "default" : "secondary"}
              className="text-xs"
              onClick={() => setView("list")}
              aria-label="Switch View"
            >
              <List className="p-1" />
            </Button>
            <Button
              size="sm"
              variant={view === "grid" ? "default" : "secondary"}
              className="text-xs"
              onClick={() => setView("grid")}
              aria-label="Switch View"
            >
              <Grid className="p-1" />
            </Button>{" "}
            <Button
              size="sm"
              variant={view === "carousel" ? "default" : "secondary"}
              className="text-xs"
              onClick={() => setView("carousel")}
              aria-label="Switch View"
            >
              <GalleryVerticalEnd className="p-1" />
            </Button>
          </div>
        </div>

        {seasons?.map(
          (season: any) =>
            season.season === activeSeason && (
              <div key={season.season} className="flex my-3 h-full flex-col">
                <SeasonContent
                  view={view}
                  id={id}
                  tv_id={tv_id}
                  season={season}
                />
              </div>
            )
        )}
      </Carousel>
    </div>
  ) : (
    <div className="w-8/12 h-[200px] mx-auto aspect-video border rounded-lg bg-muted flex-col gap-3 border-3 text-lg items-center justify-center flex text-center ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"p
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-circle-x"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
      No released episodes for this season.
    </div>
  );
};

export default SeasonTabs;
