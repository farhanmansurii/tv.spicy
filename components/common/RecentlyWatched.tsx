"use client";
import useTVShowStore from "@/store/recentsStore";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  ArrowBigDownDashIcon,
  ChevronLeft,
  ChevronRight,
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

const RecentlyWatched = () => {
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
    // <div className="w-11/12 mx-auto  mb-5">
    //   {recentlyWatched && recentlyWatched.length > 0 && (
    //     <>
    //       <div
    //         className="flex  items-center
    //    justify-between"
    //       >
    //         <h2 className="text-2xl lg:text-3xl  mx-2">Watch History</h2>

    //         <div className="flex gap-3 items-center">
    //           <Button
    //             className="w-6 h-6 p-1 rounded-full"
    //             size="icon"
    //             onClick={clearRecentlyWatched}
    //           >
    //             <X className="w-5 h-5" />
    //           </Button>
    //           <Button
    //             size="icon"
    //             className=" bg-secondary text-primary rounded-full w-6 h-6 p-1"
    //           >
    //             <ChevronLeft />
    //           </Button>
    //           <Button
    //            size="icon"
    //             className=" bg-secondary text-primary rounded-full w-6 h-6 p-1"
    //           >
    //             <ChevronRight />
    //           </Button>
    //         </div>
    //       </div>
    //       <div
    //         ref={scrollContainerRef}
    //         style={{
    //           display: "flex",
    //           overflowX: "scroll",
    //           overflowY: "unset",
    //           gap: "2px",
    //           scrollbarWidth: "none", // Hide the scrollbar in Firefox
    //           WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
    //         }}
    //       >
    //         {recentlyWatched.map((e: any) => (
    //           <Link
    //             href={`/tv/${e.tv_id}`}
    //             className="flex flex-col py-3"
    //             key={e.tvid}
    //           >
    //             <div
    //               key={e.tvid}
    //               className=" flex-none relative w-72 h-40   max-w-xs"
    //             >
    //               <div className="overlay absolute inset-0 bg-black opacity-50 "></div>
    //               <div className="episode-img-container w-full h-full  overflow-hidden">
    //                 <img
    //                   className="w-full h-full object-cover"
    //                   src={e.img?.hd}
    //                   alt={`Episode ${e.number}`}
    //                 />
    //               </div>

    //               <div className="text-xs opacity-60 absolute bottom-2 w-full px-4 text-white">
    //                 S{e.season} E{e.episode}
    //                 <h3 className="text-lg  line-clamp-1">{e.title}</h3>
    //               </div>
    //               <div className="w-full relative bottom-[5px] h-[3px]">
    //                 <div     className="absolute inset-0  dark:bg-white bg-primary-foreground"

    //                   style={{
    //                     width: e?.time ? `${e.time}%` : "0%", // Set the width dynamically based on e?.time
    //                     borderRadius: "4px", // Rounded corners
    //                     marginLeft: "2px", // Add margin to the left
    //                     height: "4px", // Set the height
    //                     transition: "width 0.3s ease-in-out", // Add a transition for smooth width changes
    //                   }}
    //                 ></div>
    //               </div>
    //             </div>
    //           </Link>
    //         ))}
    //       </div>
    //     </>
    //   )}
    // </div>

    <Carousel opts={{ dragFree: true }} className="w-[97%] my-[2rem] mx-auto">
      <div className="flex font-bold justify-between  mx-auto text-xl md:text-2xl items-center my-1 py-1 flex-row">
        <div className="mx-1 flex gap-2 items-center">
          Watch History
          <div>
            <CaretRightIcon className="h-full " />
          </div>
        </div>
        <div className="flex  gap-2">
          <Button
            variant={"outline"}
            className="text-xs rounded-full"
            onClick={clearRecentlyWatched}
          >
            Clear
            <span className="sr-only">Clear</span>
          </Button>
          <CarouselPrevious variant={"secondary"} />
          <CarouselNext variant={"secondary"} />
        </div>
      </div>
      <AnimatePresence>
        <CarouselContent className="gap-0  ">
          {recentlyWatched.map((show: any, index: number) => (
            <CarouselItem
              className={cn(
                `group basis-1/2 w-full  md:basis-1/3 lg:basis-1/4 xl:basis-1/5`
              )}
              key={show.id}
            >
              <Link href={`/tv/${show.tv_id}`}>
                <Motiondiv
                  initial="hidden"
                  animate="visible"
                  transition={{
                    delay: index * 0.1,
                    ease: "easeInOut",
                    duration: 0.5,
                  }}
                  viewport={{ amount: 0 }}
                  custom={index}
                >
                  {
                    <div key={show.id} className="relative group">
                      <img
                        alt=""
                        className="object-cover  border-transparent border group-hover:border-primary   duration-200  ease-in-out  h-full w-full "
                        src={show.img?.hd}
                      />
                      <div className="w-full relative bottom-[5px] h-[3px]">
                        <div
                          className="absolute border-red-400 border-1 -inset-y-1 inset-x-1  bg-primary-foreground"
                          style={{
                            width: show?.time ? `${show.time}%` : "0%", // Set the width dynamically based on e?.time
                            borderRadius: "1px", // Rounded corners
                            marginLeft: "2px", // Add margin to the left
                            height: "3px", // Set the height
                            transition: "width 0.3s ease-in-out", // Add a transition for smooth width changes
                          }}
                        ></div>
                      </div>
                      <svg
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        height="2em"
                        width="2em"
                        className="absolute mix-blend-difference group-hover:opacity-100 opacity-0 inset-0   scale-90 group-hover:scale-100 duration-200  ease-in-out bottom-0 right-0 m-4 text-white"
                      >
                        <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zM6.79 5.093A.5.5 0 006 5.5v5a.5.5 0 00.79.407l3.5-2.5a.5.5 0 000-.814l-3.5-2.5z" />
                      </svg>
                      <div className="p-1 relative flex  flex-col ">
                        <div className={` text-sm  line-clamp-1 `}>
                          {show.title || show.name}
                        </div>

                        <div
                          className={`text-[10px]  flex gap-1 capitalize opacity-75 `}
                        >
                          Season {show.season}
                          <p
                            className={` capitalize
                          `}
                          >
                            • Episode {show.episode}
                          </p>
                        </div>
                        {/* <p className="flex gap-2 items-center">
                  {' • ' + show.vote_average?.toFixed(2)}
                </p> */}
                      </div>
                    </div>
                  }
                </Motiondiv>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </AnimatePresence>
    </Carousel>
  );
};

export default RecentlyWatched;
