import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function RowLoader() {
  return (
    <div>
      <Carousel className="w-[96%] mx-auto">
        <CarouselContent className="w-full flex my-[3rem]  gap-1">
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
