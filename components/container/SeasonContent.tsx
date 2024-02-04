"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import EpisodeCard from "../common/EpisodeCard";
import { useEpisodeStore } from "@/store/episodeStore";
import useTVShowStore from "@/store/recentsStore";
import SeasonsTabLoader from "./SeasonsTabLoader";
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Season } from "@/lib/types";
import { Car } from "lucide-react";

interface SeasonContentProps {
  season: Season;
  id: string;
  tv_id: string;
  isGridView: boolean;
}

export const SeasonContent: React.FC<SeasonContentProps> = ({
  season,
  id,
  tv_id,
  isGridView,
}) => {
  const today = new Date();
  const releasedEpisodes = season?.episodes?.filter(
    (episode) => new Date(episode?.releaseDate) <= today && episode.id
  );
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { addRecentlyWatched } = useTVShowStore();

  const toggle = (episode: any) => {
    setActiveEP(null);
    setActiveEP({ tv_id: tv_id, time: 0, ...episode });
    addRecentlyWatched({ tv_id: tv_id, time: 0, ...episode });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return isGridView ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-0 gap-y-6 md:gap-y-10">
      {season.isReleased && releasedEpisodes?.length > 0 ? (
        releasedEpisodes?.map((episode) => (
          <EpisodeCard
            tv_id={tv_id}
            id={id}
            active={episode.id === activeEP?.id}
            toggle={toggle}
            episode={episode}
            key={episode.id}
          />
        ))
      ) : (
        <div className="h-[130px] items-center justify-center flex text-center text-lg">
          No released episodes for this season.
        </div>
      )}
    </div>
  ) : (
    <>
    <CarouselContent className="">
      {season?.episodes?.length ? (
        season.episodes.map((episode: any, index: number) => (
          <EpisodeCard index={index} key={episode.id} episode={episode} />
          ))
          ) : (
            <div className=" text-xl font-bold w-full md:w-1/3 mx-auto  flex aspect-video text-center justify-center items-center">
          No episodes found
        </div>
      )}
     
    </CarouselContent>
    <div className="flex justify-end  mt-2 gap-2 w-full mx-auto">

    <CarouselPrevious/>
    <CarouselNext/>
    </div>
      </>
  );
};
