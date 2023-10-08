"use client";
import useTVShowStore from "@/store/recentsStore";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const RecentlyWatched = () => {
  const { recentlyWatched, loadEpisodes, deleteRecentlyWatched } =
    useTVShowStore();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    loadEpisodes();
  }, []);

  const scrollTo = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentScrollLeft = container.scrollLeft;
      const targetScrollLeft = currentScrollLeft + scrollOffset;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  };
  function clearRecentlyWatched() {
    const store = useTVShowStore.getState();
    store.deleteRecentlyWatched();
  }
  return (
    <div className="w-11/12 mx-auto  mb-5">
      {recentlyWatched && recentlyWatched.length > 0 && (
        <>
          <div
            className="flex  items-center
       justify-between"
          >
            <h2 className="text-2xl lg:text-3xl  mx-2">Watch History</h2>

            <div className="flex gap-3 items-center">
              <Button
                className="w-6 h-6 p-1 rounded-full"
                size="icon"
                onClick={clearRecentlyWatched}
              >
                <X className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                onClick={() => scrollTo(-400)}
                className=" bg-secondary text-primary rounded-full w-6 h-6 p-1"
              >
                <ChevronLeft />
              </Button>
              <Button
                size="icon"
                onClick={() => scrollTo(400)}
                className=" bg-secondary text-primary rounded-full w-6 h-6 p-1"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
          <div
            ref={scrollContainerRef}
            style={{
              display: "flex",
              overflowX: "scroll",
              overflowY: "unset",
              gap: "2px",
              scrollbarWidth: "none", // Hide the scrollbar in Firefox
              WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
            }}
          >
            {recentlyWatched.map((e: any) => (
              <Link
                href={`/tv/${e.tv_id}`}
                className="flex flex-col py-3"
                key={e.tvid}
              >
                <div
                  key={e.tvid}
                  className=" flex-none relative w-72 h-40   max-w-xs"
                >
                  <div className="overlay absolute inset-0 bg-black opacity-50 "></div>
                  <div className="episode-img-container w-full h-full  overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={e.img?.hd}
                      alt={`Episode ${e.number}`}
                    />
                  </div>

                  <div className="text-xs opacity-60 absolute bottom-2 w-full px-4 text-white">
                    S{e.season} E{e.episode}
                    <h3 className="text-lg  line-clamp-1">{e.title}</h3>
                  </div>
                </div>
                <div></div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RecentlyWatched;
