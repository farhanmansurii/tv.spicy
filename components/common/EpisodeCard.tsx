/* eslint-disable @next/next/no-img-element */
import { CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import React, { useCallback } from "react";

export default function EpisodeCard(props: any) {
  const { episode, tv_id, active, toggle, key } = props;

  return (
    <div
      onClick={() => toggle(episode)}
      className={cn(
        `group basis-1/2 w-full md:basis-1/3 lg:basis-1/4 xl:basis-1/5`
      )}
    >
      <div key={episode.id} className="relative   ">
        <div
          style={{ aspectRatio: "10/5" }}
          className={cn(
            "w-full  border border-transparent",
            active && "border-primary"
          )}
        >
          <img
            alt=""
            className="object-fill opacity-75   border-transparent group-hover:border-primary   duration-200  ease-in-out  object- h-full w-full "
            src={episode.img?.mobile || episode.img?.hd}
          />
        </div>
        <p className="absolute text-white opacity-80 group-hover:mx-5   duration-100   text-6xl md:text-7xl lg:text-8xl  font-extrabold bottom-0 left m-2  ">
          {episode.episode}
        </p>
        <svg
          fill="currentColor"
          viewBox="0 0 16 16"
          height="2em"
          width="2em"
          className="absolute group-hover:opacity-100 opacity-0  scale-90 group-hover:scale-100 duration-200  ease-in-out bottom-0 right-0 m-4 text-white"
        >
          <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zM6.79 5.093A.5.5 0 006 5.5v5a.5.5 0 00.79.407l3.5-2.5a.5.5 0 000-.814l-3.5-2.5z" />
        </svg>
      </div>
      <div className="  flex p-1  flex-col ">
        <div className={` text-sm    line-clamp-1 flex gap-1 capitalize`}>
          {episode.title || episode.name}
        </div>
        <div className={`text-[10px]  flex gap-1 capitalize opacity-75 `}>
          <p>Episode {episode.episode}</p>
          <p>{" • " + episode.releaseDate}</p>
        </div>
      </div>
    </div>
  );
}
