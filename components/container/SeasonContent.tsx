"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import EpisodeCard from "../common/EpisodeCard";
import { useEpisodeStore } from "@/store/episodeStore";
import useTVShowStore from "@/store/recentsStore";
import SeasonsTabLoader from "./SeasonsTabLoader";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Episode, Season } from "@/lib/types";
import { Car, Dot } from "lucide-react";
import { Badge } from "../ui/badge";
import { format, formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import { ToastAction } from "../ui/toast";
import { toast } from "../ui/use-toast";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";

interface SeasonContentProps {
  season: Season;
  id: string;
  tv_id: string;
  view: "grid" | "list" | "carousel";
}

export const SeasonContent: React.FC<SeasonContentProps> = ({
  season,
  id,
  tv_id,
  view,
}) => {
  const today = new Date();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const releasedEpisodes = season?.episodes?.filter(
    (episode) => new Date(episode?.releaseDate) <= today && episode.id
  );
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { addRecentlyWatched } = useTVShowStore();

  const toggle = (episode: Episode) => {
    const isReleased = new Date(episode.releaseDate) <= new Date();

    if (!isReleased || !episode.id) {
      toast({
        title: "Episode Not Available Yet",
        description:
          "Stay tuned! This episode will be available soon. Check back later.",
      });
      return;
    }
    const params = new URLSearchParams(searchParams);

    setActiveEP(null);
    setActiveEP({ tv_id, time: 0, ...episode });
    addRecentlyWatched({ tv_id, time: 0, ...episode });
  };

  const renderEpisodes = (episodes: Episode[]) => {
    return episodes.map((episode) => (
      <EpisodeCard
        tv_id={tv_id}
        id={id}
        active={episode.id === activeEP?.id}
        toggle={() => toggle(episode)}
        episode={episode}
        key={episode.id}
      />
    ));
  };

  const renderNoEpisodesMessage = () => (
    <div className="h-[130px] items-center justify-center flex text-center text-lg">
      No released episodes for this season.
    </div>
  );

  const renderCarouselContent = () => (
    <>
      <CarouselContent className="space-x-2">
        {season?.episodes?.length ? (
          renderEpisodes(season.episodes)
        ) : (
          <div className="w-8/12 h-[200px] mx-auto aspect-video border rounded-lg bg-muted flex-col gap-3 border-3 text-lg items-center justify-center flex text-center ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-circle-x"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            No released episodes for this season.
          </div>
        )}
      </CarouselContent>

      <div className="flex justify-end mt-2 gap-2 w-full mx-auto">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </>
  );

  switch (view) {
    case "grid":
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
          {season.isReleased && releasedEpisodes?.length > 0
            ? renderEpisodes(season?.episodes)
            : renderNoEpisodesMessage()}
        </div>
      );

    case "list":
      return season.isReleased && releasedEpisodes?.length > 0
        ? season?.episodes?.map((episode) => (
            <EpisodeListItem
              active={episode.id === activeEP?.id}
              toggle={() => toggle(episode)}
              episode={episode}
              key={episode.id}
            />
          ))
        : renderNoEpisodesMessage();

    case "carousel":
      return renderCarouselContent();

    default:
      return null;
  }
};

const EpisodeListItem = ({
  episode,
  active,
  toggle,
}: {
  episode: Episode;
  active: Boolean;
  toggle: any;
}) => {
  return (
    <Link
      href={{
        query: {
          season: episode.season,
          episode: episode.episode,
        },
      }}
      onClick={() => toggle(episode)}
      className={cn(
        "p-2 flex flex-col gap-2 border border-transparent rounded-xl hover:pl-2 duration-100 hover:scale-105",
        active && episode?.id && "border-primary/40 p-3"
      )}
      key={episode.id}
    >
      <div className="flex line-clamp-1">
        <Badge className="whitespace-nowrap">
          {active && "Now Playing "}Episode {episode.episode}
        </Badge>
        <Dot />
        <div className="line-clamp-1 font-bold">{episode.title}</div>
      </div>
      <div className="opacity-50 text-[10px] md:text-xs">
        {format(new Date(episode.releaseDate), "PPP")}
      </div>
      <div className="text-sm text-secondary-foreground">
        {episode.description}
      </div>
    </Link>
  );
};
