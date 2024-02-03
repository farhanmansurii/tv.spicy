"use client";
'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import { CaretRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ShowCard from '../common/Card';
import useWatchListStore from "@/store/watchlistStore";
import Row from "../container/Row";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function WatchList() {
  const { watchlist, clearTVWatchlist, clearWatchlist, tvwatchlist } =
    useWatchListStore();

  return (
    <>
 <div className="flex flex-col gap-[2rem]">
      {/* <Carousel opts={{ dragFree: true }} className="w-[97%] mx-auto">
     
        <div className="flex font-bold justify-between  mx-auto text-xl md:text-2xl items-center my-1 py-1 flex-row">
          <div className="mx-1 flex gap-2 items-center">
            WatchList
            <div>
              <CaretRightIcon className="h-full " />
            </div>
          </div>
          <div className="flex  gap-2">
            <CarouselPrevious variant={'secondary'} />
            <CarouselNext variant={'secondary'} />
          </div>
        </div>
        
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 ">
            {tvwatchlist?.map((show: Show, index: number) => (
             show.backdrop_path && (
              <CarouselItem
                className={cn(
                  `group basis-1/2 w-full  md:basis-1/3 lg:basis-1/4 xl:basis-1/5`
                )}
                key={show.id}
              >
                <ShowCard
                  type={'tv'}
                  showRank={false}
                  show={show}
                  index={index}
                  isVertical={false}
                />
              </CarouselItem>
            )
            ))}
          </div>
    </Carousel>
       
      */}
       <Row
          isVertical={false}
          text={"Watchlist"}
          shows={watchlist}
          type={"movie"}
          showRank={false}
        />
        <Row
          isVertical={false}
          text={"TV Watchlist"}
          shows={tvwatchlist}
          type={"tv"}
          showRank={false}
        /> 
      
      </div>
    </>
  );
}
