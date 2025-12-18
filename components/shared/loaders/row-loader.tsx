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
    <section className="w-full py-4 space-y-2 overflow-hidden">
      {withHeader && (
        <div className="px-1 mb-1">
          <Skeleton className="h-7 w-40 md:h-8 md:w-56 bg-zinc-800/50 rounded-ui" />
        </div>
      )}

      <Carousel
        opts={{ align: 'start', dragFree: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              key={index}
              className={cn(
                "pl-3",
                !effectiveIsVertical && "basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5",
                effectiveIsVertical && "basis-[42%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[14.28%]"
              )}
            >
              <div className="py-3 flex flex-col gap-3">
                <Skeleton
                  className={cn(
                    "w-full rounded-card md:rounded-card-md bg-zinc-800/50",
                    effectiveIsVertical ? "aspect-[2/3]" : "aspect-video"
                  )}
                />

                {/* The Text Skeletons (Title & Meta) */}
                <div className="space-y-2 px-1">
                  <Skeleton className="h-4 w-3/4 bg-zinc-800/50 rounded-sm" />
                  <Skeleton className="h-3 w-1/2 bg-zinc-800/50 rounded-sm" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
