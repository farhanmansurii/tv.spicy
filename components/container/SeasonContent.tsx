import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { SeasonContentProps } from "./Seasons";
import EpisodeCard from "../common/EpisodeCard";
import { useEpisodeStore } from "@/store/episodeStore";

export const SeasonContent: React.FC<SeasonContentProps> = ({ season ,id}) => {
 
 

  return (
    <div className="gap-1 my-3 flex flex-col">
        { season.isReleased &&
          season.episodes.map((episode) => (
            <EpisodeCard id={id} episode={episode} key={episode.id} />
          ))
        //  Array(season.episodes.length)
        //     .fill(null)
        //     .map((_, index) => (
        //       <div
        //         key={index}
        //         className="flex justify-between hover:bg-primary rounded p-1 cursor-pointer flex-row gap-2 items-center"
        //       >
        //         <Skeleton className="w-[250px] aspect-video" />

        //         <div className="w-full gap-1 flex flex-col text-sm">
        //           <Skeleton className="h-[20px] w-[100px]" />
        //           <Skeleton className="h-[10px]" />
        //           <Skeleton className="h-[10px]" />
        //         </div>
        //       </div>
        //     ))
            }
      <Separator />
    </div>
  );
};
