/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import useTVShowStore from "@/store/recentsStore";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
    ArrowBigDownDashIcon,
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    X,
} from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../ui/carousel";
import { CaretRightIcon } from "@radix-ui/react-icons";
import { AnimatePresence } from "framer-motion";
import { Motiondiv } from "./MotionDiv";
import { cn } from "@/lib/utils";
import { tmdbImage } from "@/lib/tmdb-image";
import { TextGlitch } from "../animated-common/TextFlip";
import { Badge } from "../ui/badge";
import { AnimeShowCard } from "../container/anime-container.tsx/anime-show-card";
import ShowCard from "./Card";

const RecentlyWatchedTV = () => {
    const { recentlyWatched, loadEpisodes, deleteRecentlyWatched } =
        useTVShowStore();

    useEffect(() => {
        loadEpisodes();
    }, []);

    function clearRecentlyWatched() {
        const store = useTVShowStore.getState();
        store.deleteRecentlyWatched();
    }
    return (
        recentlyWatched.length > 0 && (
            <Carousel opts={{ dragFree: true }} className="w-[99%]  mx-auto">
                <div className="flex font-bold justify-between  mx-auto text-xl md:text-3xl items-center my-1 py-1 flex-row">
                    <div className="mx-1 flex gap-2 items-center">
                        <h1 className="text-2xl flex  font-bold">Recently Watched</h1>
                        <div>
                            <CaretRightIcon className="h-full " />
                        </div>
                    </div>
                    <div className="flex  gap-2">
                        {/* <Button variant={"link"} onClick={clearRecentlyWatched}>
              Clear
              <span className="sr-only">Clear</span>
            </Button> */}
                        <CarouselPrevious variant={"secondary"} />
                        <CarouselNext variant={"secondary"} />
                    </div>
                </div>
                <AnimatePresence>
                    <CarouselContent className="gap-2 ">
                        {recentlyWatched.map((show: any, index: number) => (
                            <CarouselItem
                                className={cn(
                                    `group basis-7/12 w-full  md:basis-1/3 lg:basis-3/12   `
                                )}
                                key={show.id}
                            >
                                {
                                    show.type === 'anime' ? <AnimeShowCard anime={show} /> : <ShowCard show={show} />
                                }
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </AnimatePresence>
            </Carousel>
        )
    );
};

export default RecentlyWatchedTV;
