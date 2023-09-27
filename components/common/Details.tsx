"use client";
import React from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Skeleton } from "../ui/skeleton";
import SearchBar from "../SearchBar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
const Episode = dynamic(() => import("../container/Episode"), {
  loading: () => (
    <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
  ),
});
const SeasonTabs = dynamic(() => import("../container/Seasons"), {
  loading: () => (
    <div className="w-[90%] flex flex-col mx-auto">
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className="flex justify-between hover:bg-primary rounded p-1 cursor-pointer flex-row gap-2 items-center"
          >
            <Skeleton className="w-[250px] aspect-video" />

            <div className="w-full gap-1 flex flex-col text-sm">
              <Skeleton className="h-[20px] w-[100px]" />
              <Skeleton className="h-[10px]" />
              <Skeleton className="h-[10px]" />
            </div>
          </div>
        ))}
    </div>
  ),
});

const Details = (props: any) => {
  const { data, type } = props;
  return (
    <>
      <div className="  lg:mx-auto">
        <div className="  pb-4 lg:w-100 ">
          <div className="flex flex-col    mx-auto gap-4 ">
            <div className="relative  w-full h-full md:h-[350px] z-30">
              <div className="absolute -inset-0 bg-gradient-to-t from-background to-background/20"></div>
              <img
                src={data.cover}
                className="z-0 w-full h-full md:h-[350px] object-cover object-top"
                alt="Cover Image"
              />{" "}
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
                {/* <img
                loading="lazy"
                src={data.image}
                className="w-[120px] h-full 
                md:w-[200px] rounded"
              /> */}
                <div className="flex flex-col  justify-center gap-2">
                  <div className="flex  gap-4  items-center">
                    <h1 className=" text-4xl font-bold  lg:text-5xl">
                      {data.title}
                    </h1>
                    <Button size="xs" className=" mt-1 bg-secondary ">
                      {data?.rating?.toFixed(1)}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div>{data.releaseDate.split("-")[0]}</div>
                    <Separator orientation="vertical" />
                    <div>{data.genres.slice(0, 2).join(" / ")}</div>
                    <Separator className="h-full" orientation="vertical" />
                    {type === "movie " ? (
                      <>
                        <div>
                          {" "}
                          {Math.floor(data.duration / 60)} hr{" "}
                          {data.duration % 60} min
                        </div>
                        <div>
                          {" "}
                          {Math.floor(data.duration / 60)} hr{" "}
                          {data.duration % 60} min
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                    {type === "tv" ? (
                      <div>{data.totalSeasons} Seasons</div>
                    ) : (
                      ""
                    )}
                  </div>
                  {/* <Button className="w-full  md:w-[200px] ">Play</Button> */}
                  <div className="text-sm">{data.description}</div>
                </div>
              </div>
              <Separator />
              <div className=" gap-5 p-3  flex ">
                <Button className="w-full  md:w-[200px] ">Play</Button>
                <Button className="w-full  md:w-[200px] ">Share</Button>
              </div>
            </div>
            {type === "tv" ? (
              <SeasonTabs seasons={data.seasons} defaultTab={0} />
            ) : (
              <Episode data={data} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Details;
