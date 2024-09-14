import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import React from "react";

export default function RowLoader({ withHeader }: { withHeader: boolean }) {
  return (
    <div>
      <Carousel className="ease-in-out duration-100 w-[99%] mx-auto">
        <div className="flex font-bold justify-between  mx-auto text-xl md:text-3xl items-center my-1 py-1 flex-row">
          <h1 className="text-2xl flex  text-transparent animate-pulse rounded-md bg-secondary/70 font-bold">
            Watch History
          </h1>
          <div className="flex  gap-2">
            <CarouselPrevious variant={"secondary"} />
            <CarouselNext variant={"secondary"} />
          </div>
        </div>
        <CarouselContent className="w-full flex mb-[3rem]  gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              className={cn(
                `group basis-7/12 w-full  md:basis-1/3 lg:basis-3/12 space-y-2  `
              )}
              key={index}
            >
              <Skeleton className="aspect-video" key={index} />
              <Skeleton className="h-4 w-32 " />
              <div className="flex flex-row gap-1">
                <Skeleton className="h-3 w-12 " />
                <Skeleton className="h-3 w-12" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
