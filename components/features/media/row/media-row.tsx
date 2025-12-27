'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import MediaCard from '@/components/features/media/card/media-card';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import CommonTitle from '@/components/shared/animated/common-title';

interface MediaRowProps {
  shows: Show[];
  text?: string;
  type: string;
  isVertical?: boolean;
  viewAllLink?: string;
  hideHeader?: boolean;
  headerAction?: React.ReactNode;
  gridLayout?: boolean; // Prop to toggle between Grid and Carousel
}

export default function MediaRow({
  shows,
  text,
  type,
  isVertical,
  viewAllLink,
  hideHeader = false,
  headerAction,
  gridLayout = false,
}: MediaRowProps) {
  const isMobile = useMediaQuery();
  const effectiveIsVertical = isVertical ?? isMobile;

  const validShows = useMemo(() => {
    return shows?.filter((show) =>
      effectiveIsVertical ? !!show.poster_path : !!show.backdrop_path
    ) || [];
  }, [shows, effectiveIsVertical]);

  if (validShows.length === 0) return null;

  // Render Logic for Grid Layout
  const renderGrid = () => (
    <div className={cn(
      "grid gap-4 md:gap-8",
      effectiveIsVertical
        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    )}>
      {validShows.map((show, index) => (
        <MediaCard
          key={show.id}
          type={type}
          show={show}
          index={index}
          isVertical={effectiveIsVertical}
        />
      ))}
    </div>
  );

  // Render Logic for Carousel Layout
  const renderCarousel = () => (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
      className="w-full relative"
    >
      <CarouselContent className="-ml-4 md:-ml-6 overflow-visible cursor-grab active:cursor-grabbing">
        {validShows.map((show, index) => (
          <CarouselItem
            key={show.id}
            className={cn(
              'pl-4 md:pl-6 select-none',
              !effectiveIsVertical
                ? 'basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
                : 'basis-[45%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
            )}
          >
            <MediaCard
              type={type}
              show={show}
              index={index}
              isVertical={effectiveIsVertical}
            />
          </CarouselItem>
        ))}

        {viewAllLink && (
          <CarouselItem className={cn(
              'pl-4 md:pl-6 select-none',
              !effectiveIsVertical ? 'basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4' : 'basis-[45%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
          )}>
            <Link href={viewAllLink} className="block h-full group/all">
              <div className="relative aspect-video md:h-full w-full flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] transition-colors hover:bg-white">
                  <div className="flex flex-col items-center gap-2">
                      <Plus className="w-5 h-5 text-zinc-500 group-hover/all:text-black transition-colors" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover/all:text-black transition-colors">More</span>
                  </div>
              </div>
            </Link>
          </CarouselItem>
        )}
      </CarouselContent>

      <div className="flex items-center justify-between mt-4 md:mt-6 px-1">
        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500">
           <CarouselPrevious
              className="static translate-y-0 h-8 w-8 bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white hover:text-black transition-all"
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <CarouselNext
              className="static translate-y-0 h-8 w-8 bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white hover:text-black transition-all"
              icon={<ChevronRight className="h-4 w-4" />}
            />
        </div>
      </div>
    </Carousel>
  );

  return (
    <div className="w-full space-y-0 py-4 group/row overflow-visible">
      {!hideHeader && (
        <div className="flex items-end justify-between px-1 mb-4 md:mb-6">
          <CommonTitle
            text={text || "Featured"}
            variant="small"
            as="h2"
            spacing="none"
            className="text-lg md:text-xl font-bold tracking-tight text-white/90"
          />
          {headerAction && (
            <div className="flex items-center animate-in fade-in slide-in-from-right-2 duration-500">
              {headerAction}
            </div>
          )}
        </div>
      )}
      {gridLayout ? renderGrid() : renderCarousel()}
    </div>
  );
}
