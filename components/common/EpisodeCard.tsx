import { CarouselItem } from "@/components/ui/carousel";
import { tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";
import { ImageIcon, Play } from "lucide-react";
import React, { useCallback } from "react";
import { TextGlitch } from "../animated-common/TextFlip";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function EpisodeCard(props: any) {
  const { episode, active, toggle } = props;
  return (
    <CarouselItem
      onClick={() => toggle(episode)}
      className={cn(
        `group basis-[48.75%] w-full md:basis-[32.75%] group duration-100 hover:scale-95`
      )}
    >
      <div key={episode.id} className="relative   ">
        <div
          style={{ aspectRatio: 16 / 9 }}
          className="relative h-full   flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/20 shadow"
        >
          {episode.img?.mobile || episode.img?.hd ? (
            <div>
              <img
                className={"object-cover  inset-0 object-fit"}
                src={tmdbImage(episode.img?.mobile || episode.img?.hd, "w500")}
                alt={"title"}
              />

              {active ? (
                <div className="absolute text-xs lg:text-md flex items-center gap-1 duration-200 ease-in-out bottom-0 right-0 m-3 text-white">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    height="1.5em"
                    width="1.5em"
                  >
                    <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
                  </svg>
                  <span>Now Playing</span>
                </div>
              ) : (
                <svg
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height="2em"
                  width="2em"
                  className="absolute group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
                >
                  <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
                </svg>
              )}
              <Badge className="absolute top-0 m-1 right-0">
                EP {episode.episode}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-background">
              <ImageIcon className="text-muted" />
            </div>
          )}
        </div>
      </div>
      <div className="w-full items-center space-x-2  flex flex-row">
        {active && (
          <svg
            fill="currentColor"
            viewBox="0 0 16 16"
            height="2em"
            width="2em"
            className="text-primary"
          >
            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
          </svg>
        )}
        <div className="my-2">
          <div className="flex items-start text-sm md:text-base justify-between gap-1">
            <TextGlitch>{episode.title || episode.name}</TextGlitch>
          </div>
          <div
            className={`text-xs text-muted-foreground flex gap-1 capitalize  ${""}`}
          >
            {format(new Date(episode.releaseDate), "PPP")}
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
