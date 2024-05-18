import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function RowLoader({ withHeader }: { withHeader: boolean }) {
  return (
    <div>
      <Carousel className="w-[96%] mx-auto">
        {withHeader && (
          <div className="flex font-bold justify-between mx-auto text-xl md:text-2xl items-center my-1 py-1 flex-row animate-pulse">
            <div className="mx-1 flex gap-2 items-center">
              <div className="w-44 h-6 bg-muted  rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted  rounded-full"></div>
              <div className="h-8 w-8 bg-muted  rounded-full"></div>
            </div>
          </div>
        )}
        <CarouselContent className="w-full flex mb-[3rem]  gap-1">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              className="basis-1/2 w-full flex gap-1 flex-col md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              key={index}
            >
              <Skeleton className="aspect-video " key={index} />
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
