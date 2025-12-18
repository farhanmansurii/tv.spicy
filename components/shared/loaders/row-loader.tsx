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
  isVertical = false
}: {
  withHeader: boolean;
  isVertical?: boolean;
}) {
  const isMobile = useMediaQuery();
  const effectiveIsVertical = isMobile || isVertical;

  return (
    <section className="w-full py-2 md:py-4 space-y-2 overflow-visible relative">
      {withHeader && (
        <div className="flex items-end justify-between px-1 mb-1">
          <Skeleton className="h-7 w-40 md:h-8 md:w-56 bg-zinc-800/50 rounded-ui" />
        </div>
      )}

      <Carousel
        opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps' }}
        className="w-full group/row relative px-0"
      >
        <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              key={index}
              className={cn(
                "pl-2 md:pl-4 transition-all duration-300",
                !effectiveIsVertical && "basis-[85%] sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
                effectiveIsVertical && "basis-[45%] sm:basis-1/3 md:basis-1/3 lg:basis-1/4"
              )}
            >
              <div className="py-2 flex flex-col gap-3 w-full transition-transform duration-500 ease-out">
                <Skeleton
                  className={cn(
                    "relative w-full overflow-hidden bg-zinc-800 shadow-md rounded-card md:rounded-card-md",
                    effectiveIsVertical ? "aspect-[2/3]" : "aspect-video"
                  )}
                />

                {/* The Text Skeletons (Title & Meta) */}
                <div className="flex flex-col gap-1 px-1">
                  <Skeleton className="h-[15px] w-3/4 bg-zinc-800/50 rounded-sm" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[13px] w-12 bg-zinc-800/50 rounded-sm" />
                    <Skeleton className="h-3 w-3 bg-zinc-800/30 rounded-full" />
                    <Skeleton className="h-[13px] w-10 bg-zinc-800/50 rounded-sm" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
