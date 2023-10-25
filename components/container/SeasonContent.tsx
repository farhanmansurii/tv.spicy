"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { SeasonContentProps } from "./Seasons";
import EpisodeCard from "../common/EpisodeCard";
import { useEpisodeStore } from "@/store/episodeStore";
import useTVShowStore from "@/store/recentsStore";
import SeasonsTabLoader from "./SeasonsTabLoader";

export const SeasonContent: React.FC<SeasonContentProps> = ({
  season,
  id,
  tv_id,
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
      behavior: "smooth"
    });
  };

  return (
    <>
      <div className="gap-1 my-4 flex flex-col">
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

        <Separator />
      </div>
    </>
  );
};
