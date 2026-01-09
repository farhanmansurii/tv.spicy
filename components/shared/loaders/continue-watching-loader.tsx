'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export function ContinueWatchingLoader() {
  return (
    <div className="w-full space-y-0 py-4 group/row overflow-visible min-h-[280px]">
      {/* Header */}
      <div className="flex items-end justify-between px-1 mb-4 md:mb-6">
        <Skeleton className="h-7 w-48 md:h-8 md:w-64 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Scrollable Carousel */}
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-4 md:-ml-6 overflow-visible">
          {Array.from({ length: 4 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="pl-4 md:pl-6 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="flex flex-col gap-3 w-full">
                <Skeleton className="relative w-full aspect-video rounded-lg md:rounded-xl" />
                <div className="flex flex-col gap-0.5 px-1">
                  <Skeleton className="h-[14px] w-3/4 rounded-sm" />
                  <Skeleton className="h-[12px] w-1/2 rounded-sm" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
