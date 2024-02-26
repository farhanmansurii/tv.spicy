"use client";
import React, { useState } from "react"; // Import React if not already imported
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SeasonContent } from "./SeasonContent";
import { useEpisodeStore } from "@/store/episodeStore";
import { ChevronRight, Play } from "lucide-react";
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
const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, id, tv_id }) => {
  const [activeSeason, setActiveSeason] = useState<any>(seasons[0]?.season);
  const [isGridView, setIsGridView] = useState(false);
  return activeSeason ? (
    <div className="w-full  flex flex-col mx-auto">
      <Carousel
        opts={{ dragFree: true }}
        className=" w-[96%] justify-between mx-auto my-[3rem] "
      >
        <div className="flex font-bold justify-between  mb-4   text-xl md:text-2xl   py-1 flex-row">
          <Select
            defaultValue={"1"}
            onValueChange={(value) => setActiveSeason(value)}
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

          <Toggle
            size="sm"
            className="text-xs"
            onClick={() => setIsGridView((prev) => !prev)}
            aria-label="Switch View"
          >
            Switch to {isGridView ? "List View" : "Grid View"}
          </Toggle>
        </div>

        {seasons?.map(
          (season: any) =>
            season.season === activeSeason && (
              <div key={season.season} className="flex h-full flex-col">
                <SeasonContent
                  isGridView={isGridView}
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
    <div className="w-96 aspect-video flex mx-auto font-bold text-2xl justify-center items-center">
      {" "}
      No episodes
    </div>
  );
};

export default SeasonTabs;
