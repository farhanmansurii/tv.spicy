import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function SeasonsTabLoader() {
  const numEpisodes = 10;

  return (
    <div className="flex w-full max-w-4xl   mx-auto flex-col">
      <div className="flex mb-2 gap-2">
        <Skeleton className="w-40  h-8"></Skeleton>
      </div>
      <Carousel>
        <CarouselContent className="w-full flex mb-[3rem]  space-x-2">
          {Array.from({ length: numEpisodes }).map((_, index) => (
            <CarouselItem
              className="`group basis-1/2 space-y-2 w-full md:basis-1/3 group duration-100 hover:scale-95`"
              key={index}
            >
              <Skeleton
                style={{ aspectRatio: 16 / 9 }}
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
