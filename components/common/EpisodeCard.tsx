/* eslint-disable @next/next/no-img-element */
import { CarouselItem } from "@/components/ui/carousel";
import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import React, { useCallback } from "react";
import { TextGlitch } from "../animated-common/TextFlip";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
export default function EpisodeCard(props: any) {
  const { episode, tv_id, active, toggle } = props;

  return (
    <CarouselItem
      onClick={() => toggle(episode)}
      className={cn(`group basis-1/2 w-full md:basis-1/3 `)}
    >
      <div key={episode.id} className="relative   ">
        <div
          style={{ aspectRatio: 16 / 9 }}
          className="relative h-full  flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow"
        >
          {episode.img?.mobile || episode.img?.hd ? (
            <div>
              <img
                className="object-cover  inset-0"
                src={tmdbImage(episode.img?.mobile || episode.img?.hd, "w500")}
                alt={"title"}
              />
              <svg
                fill="currentColor"
                viewBox="0 0 16 16"
                height="2em"
                width="2em"
                className="absolute group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
              >
                <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-background">
              <ImageIcon className="text-muted" />
            </div>
          )}
        </div>

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
      <div className="w-full items-center space-x-2  flex flex-row">
        <Button variant={"link"} className="h-full  p-4">
          EP {episode.episode}
        </Button>
        <div className="my-2">
          <div className="flex items-start text-sm md:text-base justify-between gap-1">
            <TextGlitch>{episode.title || episode.name}</TextGlitch>
          </div>
          <div
            className={`text-xs text-muted-foreground flex gap-1 capitalize  ${""}`}
          >
            {format(new Date(episode.releaseDate), "PPP")}
            {/* <p
            className={`${
              (media_type || type)?.toLowerCase() === "tv"
                ? "uppercase"
                : "capitalize"
            }`}
          >
            • {type ? type : media_type}
          </p>
          <p className="flex gap-2 items-center">
            {" • " + voteAverage?.toFixed(2)}
          </p> */}
          </div>
          {/* <p className="line-clamp-3 text-xs text-muted-foreground">{overview}</p> */}
        </div>
      </div>
    </CarouselItem>
  );
}
