'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';

export default function RowLoader({
  withHeader,
  isVertical = false,
  gridLayout = false,
}: {
  withHeader: boolean;
  isVertical?: boolean;
  gridLayout?: boolean;
}) {
  const isMobile = useMediaQuery();
  const effectiveIsVertical = isVertical ?? isMobile;

  // Grid Layout Loader
  if (gridLayout) {
    return (
      <div className="w-full space-y-0 py-4 group/row overflow-visible">
        {withHeader && (
          <div className="flex items-end justify-between px-1 mb-4 md:mb-6">
            <Skeleton className="h-7 w-40 md:h-8 md:w-56 rounded-ui" />
          </div>
        )}
        <div className={cn(
          "grid gap-4 md:gap-8",
          effectiveIsVertical
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
              <Skeleton
                className={cn(
                  "relative w-full overflow-hidden rounded-lg md:rounded-xl",
                  effectiveIsVertical ? "aspect-[2/3]" : "aspect-video"
                )}
              />
              <div className="flex flex-col gap-0.5 px-1">
                <Skeleton className="h-[14px] w-3/4 rounded-sm" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-[12px] w-12 rounded-sm" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-[12px] w-10 rounded-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Carousel Layout Loader
  return (
    <div className="w-full space-y-0 py-4 group/row overflow-visible">
      {withHeader && (
        <div className="flex items-end justify-between px-1 mb-4 md:mb-6">
          <Skeleton className="h-7 w-40 md:h-8 md:w-56 rounded-ui" />
        </div>
      )}

      <Carousel
        opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps' }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-4 md:-ml-6 overflow-visible cursor-grab active:cursor-grabbing">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              key={index}
              className={cn(
                "pl-4 md:pl-6 select-none",
                !effectiveIsVertical
                  ? "basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  : "basis-[45%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              )}
            >
              <div className="flex flex-col gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                <Skeleton
                  className={cn(
                    "relative w-full overflow-hidden rounded-lg md:rounded-xl",
                    effectiveIsVertical ? "aspect-[2/3]" : "aspect-video"
                  )}
                />

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

        {/* Navigation buttons skeleton */}
        <div className="flex items-center justify-between mt-4 md:mt-6 px-1">
          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </Carousel>
    </div>
  );
}
