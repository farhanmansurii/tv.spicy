"use client";
import { useEpisodeStore } from "@/store/episodeStore";
import React, { Suspense, useEffect } from "react";
import Episode from "../container/Episode";
import { Skeleton } from "../ui/skeleton";
import useTVShowStore from "@/store/recentsStore";
import next from "next";
interface T {
  tv: string;
}
export const TVContainer: React.FC<T> = (props: any) => {
  const { tv } = props;
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { recentlyWatched, addToRecentlyWatched, loadRecentlyWatched } =
    useTVShowStore();
  useEffect(() => {
    const recentlyWatchedEpisode = recentlyWatched.find(
      (episode) => episode.tv_id === tv?.id
    );

    if (recentlyWatchedEpisode) {
      setActiveEP(recentlyWatchedEpisode);
    } else if (activeEP.tv_id !== tv?.id) {
      setActiveEP({ tv_id: tv?.id, ...tv?.seasons[0]?.episodes[0] });
    }
  }, [activeEP]);

  function setNextEp(activeEP: any) {
    const si = tv.seasons.findIndex((s: any) => s.season === activeEP.season);
    const ei = tv.seasons[si].episodes.findIndex(
      (e: any) => e.id === activeEP.id
    );

    if (ei === tv.seasons[si].episodes.length - 1) {
      if (si === tv.seasons.length - 1) return;

      const next = {
        tv_id: tv.id,
        ...tv.seasons[si + 1].episodes[0],
      };
      console.log(next);
      // addToRecentlyWatched(next);
      // setActiveEP(next);
    } else {
      const next = {
        tv_id: tv.id,
        ...tv.seasons[si].episodes[ei + 1],
      };
      console.log(next);
      // addToRecentlyWatched(next);
      // setActiveEP(next);
    }
  }
  return (
    <>
      {activeEP?.id && (
        <Episode episodeId={activeEP.id} id={tv.id} type={"tv"} />
      )}
    </>
  );
};
