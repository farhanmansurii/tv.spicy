import React, { Suspense } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import SearchBar from "../SearchBar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DetailLoader from "../loading/DetailLoader";
import { Skeleton } from "../ui/skeleton";
import ShowContainer from "./ShowContainer";
import ContinueWatchingButton from "./ContinueWatchingButton";
import { formatRelativeTime } from "@/lib/utils";
import ThemeButton from "./ThemeButton";
import SeasonsTabLoader from "../container/SeasonsTabLoader";
const Seperator = () => <div className="text-ring font-bold">|</div>;
const Details = (props: any) => {
  const { data, type } = props;
  return (
    <>
      <div className="  lg:mx-auto">
        <div className="  pb-4 lg:w-100 ">
          <div className="flex flex-col    mx-auto gap-4 ">
            <div className="relative  w-full h-full md:h-[400px] z-30">
              <div className="absolute -inset-0 -inset-y-2 bg-gradient-to-t from-background to-background/20"></div>
              <div className="w-full aspect-video md:h-[400px] ">
                <img
                  src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
                  className="z-0 w-full h-full md:h-[400px] object-cover object-top"
                  alt=""
                />
              </div>
              <div className="w-full absolute justify-center flex  top-0">
                <div className="flex p-4 items-center w-full lg:w-11/12 justify-between mx-auto">
                  <Link href="/">
                    <Button
                      size="icon"
                      className="rounded-full w-10 h-10  md:w-12 md:h-12 "
                    >
                      <ArrowLeft className="  rounded p-1" />
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center gap-4">
                    <ThemeButton />
                    <SearchBar />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[90%] flex flex-col mx-auto">
              <div className="flex flex-row  gap-4 ">
                <div className="flex flex-col  justify-center gap-2">
                  <div className="flex  gap-4  items-center w-11/12 ">
                    <h1 className=" text-4xl font-bold  lg:text-5xl">
                      {data.name || data.title}
                    </h1>
                    <Button size="xs" className=" mt-1  ">
                      {data?.vote_average?.toFixed(1)}
                    </Button>
                  </div>
                  <div className="flex line-clamp-1 w-11/12 flex-wrap flex-row  gap-2">
                    <div>
                      {data.first_air_date?.split("-")[0] ||
                        data.release_date?.split("-")[0]}
                    </div>
                    <Seperator/>
                    <div className="line-clamp-1 whitespace-nowrap">
                      {data.genres[0]?.name}
                      {data.genres[1] && "/" + data.genres[1]?.name}
                    </div>
                    <Seperator/>
                    {data.runtime && (
                      <div>
                        {Math.floor(data?.runtime / 60)} hr {data?.runtime % 60}{" "}
                        min
                      </div>
                    )}

                    {data.number_of_seasons && (
                      <div className="whitespace-nowrap ">
                        {data?.number_of_episodes} Episodes
                      </div>
                    )}
                  </div>
                  {/* <Button className="w-fit px-4 ">Play</Button> */}
                  {data.tagline && (
                    <blockquote className=" opacity-70 italic">
                      {`"${data.tagline}"`}
                    </blockquote>
                  )}

                  {}

                  <ContinueWatchingButton
                    id={data.id}
                    show={data}
                    type={type}
                  />
                  {data.next_episode_to_air && (
                    <Button variant="secondary" className="w-fit">
                      {formatRelativeTime(data.next_episode_to_air.air_date) +
                        " for new episode !! "}
                    </Button>
                  )}
                  <div className="text-sm opacity-50 line-clamp-5">
                    {data.overview}
                  </div>
                </div>
              </div>
            </div>
            <Separator className="w-[90%] mx-auto" />
            <Suspense
              fallback={
                type === "tv" ? (
                  <SeasonsTabLoader />
                ) : (
                  <Skeleton className="aspect-video w-[90%] lg:w-[600px]  mx-auto " />
                )
              }
            >
              <ShowContainer id={data.id} type={type} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};
export default Details;
