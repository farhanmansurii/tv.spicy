import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { cn } from "@/lib/utils";

export default function SeasonsTabLoader() {
  const numSeasons = 2;
  const numEpisodes = 10;

  const generateSkeletons = (count: number) => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(
        <div key={i} className="w-full flex flex-col gap-2 ">
          <Skeleton className="h-full aspect-video drop drop-shadow-lg " />
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
    <div className="flex w-full  mx-auto flex-col">
      <div className="flex mb-2 gap-2">
        {Array(1).fill(
          <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background text-transparent">
            Season 1
          </div>
        )}
      </div>
      <Carousel>
        <CarouselContent className="w-full flex mb-[3rem]  gap-1">
          {Array.from({ length: numEpisodes }).map((_, index) => (
            <CarouselItem
              className="basis-1/2 w-full flex gap-1 flex-col md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              key={index}
            >
              <Skeleton
                style={{ aspectRatio: "10/5" }}
                className={cn("w-full  border border-transparent")}
                key={index}
              />
              <Skeleton className="h-4 w-32 " />
              <div className="flex flex-row gap-1">
                <Skeleton className="h-3 w-6 " />
                <Skeleton className="h-3 w-6 " />
                <Skeleton className="h-3 w-6 " />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
