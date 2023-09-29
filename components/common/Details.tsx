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
                      className="rounded-full w-12 h-12  md:w-16 md:h-16 "
                    >
                      <ArrowLeft className="  rounded" />
                    </Button>
                  </Link>
                  <div>
                    {" "}
                    <SearchBar />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[90%] flex flex-col mx-auto">
              <div className="flex flex-row p-2 gap-4 ">
                <div className="flex flex-col  justify-center gap-2">
                  <div className="flex  gap-4  items-center">
                    <h1 className=" text-4xl font-bold  lg:text-5xl">
                      {data.name || data.title}
                    </h1>
                    <Button size="xs" className=" mt-1 bg-secondary ">
                      {data?.vote_average?.toFixed(1)}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div>
                      {data.first_air_date?.split("-")[0] ||
                        data.release_date?.split("-")[0]}
                    </div>
                    <Separator orientation="vertical" />
                    <div>
                      {data.genres
                        .slice(0, 2)
                        .map((genre: any) => genre.name)
                        .join(" / ")}
                    </div>
                    <Separator className="h-full" orientation="vertical" />
                    {data.runtime && (
                      <div>
                        {Math.floor(data?.runtime / 60)} hr {data?.runtime % 60}{" "}
                        min
                      </div>
                    )}

                    {data.number_of_seasons && (
                      <div>{data?.number_of_episodes} Episodes</div>
                    )}
                  </div>
                  {/* <Button className="w-fit px-4 ">Play</Button> */}
                  {data.tagline && (
                    <blockquote className=" opacity-70 italic">
                      {`"${data.tagline}"`}
                    </blockquote>
                  )}
                  <div className="text-sm opacity-50">{data.overview}</div>
                </div>
              </div>
              <Separator />
              <div className=" gap-2 py-3  lg:justify-normal flex ">
                <Button size="sm" className="w-fit text-xs  gap-2 ">
                  Add to watchlist
                </Button>
                <Button size="sm" className="w-fit text-xs  gap-2">
                  Share
                </Button>
              </div>
            </div>
            <Suspense
              fallback={
                <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
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
