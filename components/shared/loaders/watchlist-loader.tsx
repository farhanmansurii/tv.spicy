'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export function WatchlistLoader() {
  return (
    <div className="w-full space-y-0 py-4 group/row overflow-visible min-h-[280px]">
      <div className="flex items-end justify-between px-1 mb-4 md:mb-6">
        <Skeleton className="h-7 w-40 md:h-8 md:w-56 rounded-lg" />
      </div>

      <Carousel
        opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps' }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-4 md:-ml-6 overflow-visible">
          {Array.from({ length: 6 }).map((_, index) => (
            <CarouselItem
              key={index}
              className={cn(
                "pl-4 md:pl-6 select-none",
                "basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              )}
            >
              <div className="flex flex-col gap-3 w-full">
                <Skeleton className="relative w-full aspect-video rounded-lg md:rounded-xl" />
                <div className="flex flex-col gap-0.5 px-1">
                  <Skeleton className="h-[14px] w-3/4 rounded-sm" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[12px] w-12 rounded-sm" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-[12px] w-10 rounded-sm" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
