/* eslint-disable @next/next/no-img-element */
import { TextGlitch } from "@/components/animated-common/TextFlip";
import { Motiondiv } from "@/components/common/MotionDiv";
import { Badge } from "@/components/ui/badge";
import { Anime, Show } from "@/lib/types";
import { ImageIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export const AnimeShowCard = ({ anime }: { anime: Anime }) => {
  const { cover, image, title, rating, releaseDate } = anime;

  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="w-full h-full flex flex-col  group group-hover:scale-95 duration-100 cursor-pointer space-y-2">
        <div className="relative h-full  flex aspect-poster w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow">
          {cover || image ? (
            <div className="aspect-poster  ">
              <img
                src={image}
                alt={title.english}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
              <svg
                fill="currentColor"
                viewBox="0 0 16 16"
                height="2em"
                width="2em"
                className="absolute z-40 group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
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
        <div className="space-y-1.5 ">
          <div className="flex text-sm md:text-base items-start justify-between gap-1">
            <TextGlitch>
              {title.english || title.userPreferred || "hi"}
            </TextGlitch>
            <Badge variant="secondary">
              {rating ? (rating / 10).toFixed(1) : "?"}
            </Badge>
          </div>
          <div
            className={`text-xs text-muted-foreground flex gap-1 capitalize `}
          >
            {releaseDate}{" "}
          </div>
          {/* <p className="line-clamp-3 text-xs text-muted-foreground">{overview}</p> */}
        </div>
      </div>
    </Link>
  );
};
