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
import ShowCard from "../common/Card";

export default function Row(props: {
  shows: Show[];
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
        {!props.isVertical ? (
          <CarouselContent className="gap-0  ">
            {props?.shows?.map(
              (show: Show, index: number) =>
                show.backdrop_path && (
                  <CarouselItem
                    className={cn(
                      `group basis-1/2 w-full  md:basis-1/3 lg:basis-1/4 xl:basis-1/5`
                    )}
                    key={show.id}
                  >
                    <ShowCard
                      type={props.type}
                      showRank={props.showRank}
                      show={show}
                      index={index}
                      isVertical={props.isVertical}
                    />
                  </CarouselItem>
                )
            )}
          </CarouselContent>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-1 ">
            {props?.shows?.map(
              (show: Show, index: number) =>
                show.backdrop_path && (
                  <ShowCard
                    key={index}
                    showRank={props.showRank}
                    variants={variants}
                    show={show}
                    type={props.type}
                    index={index}
                    isVertical={props.isVertical}
                  />
                )
            )}
          </div>
        )}
      </AnimatePresence>
    </Carousel>
  );
}
