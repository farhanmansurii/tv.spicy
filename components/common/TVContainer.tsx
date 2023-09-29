"use client";
import React, { Suspense, useEffect } from "react";
import Episode from "../container/Episode";
import useTVShowStore from "@/store/recentsStore";
import { useEpisodeStore } from "@/store/episodeStore";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface T {
  tv: any;
}

export const TVContainer: React.FC<T> = ({ tv }: T) => {
  const { recentlyWatched } = useTVShowStore();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const recentlyWatchedEpisode = recentlyWatched.find(
    (episode) => episode.tv_id === tv?.id
  );

  useEffect(() => {
    if (activeEP.tv_id !== tv?.id) {
      setActiveEP({ tv_id: tv?.id, ...(tv?.seasons[0]?.episodes[0] || {}) });
    }
  }, [activeEP]);

  return (
    <>
      {recentlyWatchedEpisode &&
        recentlyWatchedEpisode.episode !== activeEP?.episode && (
          <Button onClick={()=>setActiveEP(recentlyWatchedEpisode)}>Continue S{recentlyWatchedEpisode.season}E{recentlyWatchedEpisode?.episode}</Button>
        )}
      {activeEP?.id && (
        <Suspense
          fallback={
            <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
          }
        >
          <Episode episodeId={activeEP.id} id={tv.id} type={"tv"} />
        </Suspense>
      )}
    </>
  );
};
