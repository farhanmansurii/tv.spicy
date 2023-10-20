import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function SeasonsTabLoader() {
  const numSeasons = 2; 
  const numEpisodes = 10; 

  const generateSkeletons = (count:number) => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(
        <div key={i} className="h-[88.5px] flex flex-row gap-2 sm:h-[113px] md:h-[127px]">
          <Skeleton className="h-full aspect-video drop drop-shadow-lg relative" />
          <div className="flex gap-2 justify-center flex-col">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-32 h-6" />
          </div>
        </div>
      );
    }
    return skeletons;
  };

  return (
    <div className="flex w-11/12 mx-auto flex-col">
      <div className="flex gap-2">
        {Array(numSeasons).fill(
          <Skeleton className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background text-transparent">
            Season 1
          </Skeleton>
        )}
      </div>
      <div className="gap-1 my-4 flex flex-col">
        {generateSkeletons(numEpisodes)}
      </div>
    </div>
  );
}
