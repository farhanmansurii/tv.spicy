/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { } from "react";
import { Header } from "@/components/common/header";
import useTitle from "@/lib/use-title";
import RecentlyWatchedTV from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import { SearchCommandBox } from "./search-command-box";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MinimalSocialsFooter from "@/components/common/Footer";


export default function HomeContainer() {
    const { title } = useTitle();
    return title && (
        <div className="">
            <Header />
            <div className="mx-auto  max-w-3xl space-y-4 px-4 lg:px-0">
                <div className="max-w-xl  px-2 pt-56">
                    <h1 className="text-3xl font-bold text-white sm:text-3xl md:text-4xl">
                        {title}
                    </h1>
                </div>
                <div className="flex flex-row py-3 px-2 items-center gap-3">
                    Search for :
                    <SearchCommandBox searchType="tvshow">
                      <Button variant={'gooeyLeft'} size={'sm'}>
                            TV Show
                        </Button>
                    </SearchCommandBox>
                    <SearchCommandBox searchType="anime">
                       <Button variant={'gooeyRight'} size={'sm'}>
                            Anime
                        </Button>
                    </SearchCommandBox>
                </div>
                <Separator className="my-5"/>
                <div className=" w-full">
                    <div className=" space-y-4 w-full">
                        <RecentlyWatchedTV />
                        <WatchList type="movie" />
                        <WatchList type="tv" />
                    </div>
                </div>
            </div>
             <MinimalSocialsFooter/>
        </div>
    );
}
