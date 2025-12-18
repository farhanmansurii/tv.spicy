/* eslint-disable @next/next/no-img-element */
'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import React from 'react';
import MediaCard from '@/components/features/media/card/media-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-hook';
import CommonTitle from '@/components/shared/animated/common-title';

export default function MediaRow(props: {
  shows: Show[];
  text?: string;
  showRank?: boolean;
  type: string;
  isVertical?: boolean;
  viewAllLink?: string;
  headerAction?: React.ReactNode;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const effectiveIsVertical = isMobile || props.isVertical;
  const useGrid = props.isVertical; // Use grid when explicitly vertical (not just mobile)

  const validShows = props?.shows?.filter((show: Show) => {
    const hasImage = effectiveIsVertical ? show.poster_path : show.backdrop_path;
    return hasImage;
  }) || [];

  return (
    <section className="w-full py-4 space-y-2 overflow-visible relative">
      {/* Header Section */}
      <div className="flex items-end justify-between px-1 mb-1">
        {props.text && (
          <CommonTitle
            text={props.text}
            variant="section"
            as="h2"
          />
        )}
        {props.viewAllLink && (
          <Link
            href={props.viewAllLink}
            className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-[0.15em]"
          >
            See All
          </Link>
        )}
      </div>

      {useGrid ? (
        /* Grid Layout for Vertical Cards */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {validShows.map((show: Show, index: number) => (
            <MediaCard
              key={show.id}
              type={props.type}
              show={show}
              index={index}
              isVertical={true}
            />
          ))}
        </div>
      ) : (
        /* Carousel Layout for Horizontal Cards */
        <Carousel
          opts={{
            align: 'start',
            dragFree: true,
            containScroll: 'trimSnaps',
          }}
          className="w-full group/row relative px-0"
        >
          {/* Carousel Navigation Buttons - Top Right */}
          <div className="hidden lg:flex absolute -top-12 right-0 z-50 items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
            <CarouselPrevious
              className="static translate-y-0 h-8 w-8 border-none bg-zinc-900/80 backdrop-blur-md text-white hover:bg-white hover:text-black rounded-ui"
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <CarouselNext
              className="static translate-y-0 h-8 w-8 border-none bg-zinc-900/80 backdrop-blur-md text-white hover:bg-white hover:text-black rounded-ui"
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>

          <CarouselContent className="-ml-3 overflow-visible">
            {validShows.map((show: Show, index: number) => (
              <CarouselItem
                key={show.id}
                className={cn(
                  "pl-3 transition-all duration-500",
                  "basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                )}
              >
                <div className="py-3">
                  <MediaCard
                    type={props.type}
                    show={show}
                    index={index}
                    isVertical={false}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}
