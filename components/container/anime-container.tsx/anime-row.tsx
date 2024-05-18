/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Show } from "@/lib/types";
import { CaretRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AnimeShowCard from "./anime-show-card";

export default function AnimeRow(props: {
  anime: any[];
  text?: string;
  showRank?: boolean;
  type: string;
  action?: () => void;
  isVertical?: boolean;
}) {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: 0.05 },
    }),
  };
  return (
    <Carousel opts={{ dragFree: true }} className="w-[97%] mx-auto">
      {props.text && (
        <div className="flex font-bold justify-between  mx-auto text-xl md:text-3xl items-center my-1 py-1 flex-row">
          <div className="mx-1 flex gap-2 items-center">
            {props.text}{" "}
            <div>
              <CaretRightIcon className="h-full " />
            </div>
          </div>
          <div className="flex  gap-2">
            <CarouselPrevious variant={"secondary"} />
            <CarouselNext variant={"secondary"} />
          </div>
        </div>
      )}

      <AnimatePresence>
        {/* {!props.isVertical ? (
          <CarouselContent className="gap-0  ">
            {props?.anime?.map((show: any[], index: number) => (
              <CarouselItem
                className={cn(
                  `group basis-1/2 w-full  md:basis-1/3 lg:basis-1/4 xl:basis-1/5`
                )}
                key={index}
              >
                <AnimeShowCard index={index} show={show} isVertical={false} />
              </CarouselItem>
            ))}
          </CarouselContent>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 ">
            {props?.anime?.map((show: any[], index: number) => (
              <img key={index} alt="" src={show?.image} />
            ))}
          </div>
        )}
        <div></div> */}
        <div>hello</div>
      </AnimatePresence>
    </Carousel>
  );
}
