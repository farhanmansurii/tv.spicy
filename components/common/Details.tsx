import React from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Share2 } from "lucide-react";
import { Share1Icon } from "@radix-ui/react-icons";
import PlayButton from "./PlayButton";
import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
const Episode = dynamic(() => import("../container/Episode"));

const Details = (props: any) => {
  const { data } = props;
  return (
    <>
      <div className="  lg:mx-auto">
        <div className="  pb-4 lg:w-100 ">
          <div className="flex flex-col   lg:w-11/12 mx-auto gap-4 ">
            <div className="relative h-full z-30">
              <div className="absolute -inset-0 bg-gradient-to-t from-background to-background/20"></div>
              <img src={data.cover} className="z-0 w-full aspect-video h-1/2" />
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
                    <div>
                      {" "}
                      {Math.floor(data.duration / 60)} hr {data.duration % 60}{" "}
                      min
                    </div>
                  </div>
                  <Button className="w-full  md:w-[200px] ">Play</Button>
                  <div className="text-sm">{data.description}</div>
                </div>
              </div>
              <Separator />
              <div className=" gap-5 p-3  flex ">
                <Button className="w-full  md:w-[200px] ">Play</Button>
                <Button className="w-full  md:w-[200px] ">Share</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Episode data={data} />
    </>
  );
};
4;
export default Details;
