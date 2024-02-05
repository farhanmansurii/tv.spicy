"use client";
import React, { useEffect } from "react";
import Episode from "../container/Episode";
import { useEpisodeStore } from "@/store/episodeStore";
import { Button } from "../ui/button";

interface T {
  tv: any;
  tv_id: string;
}

interface EpisodeType {
  id: string;
  season: number;
}

interface TVSeason {
  season: number;
  episodes: EpisodeType[];
}

export const TVContainer: React.FC<T> = ({ tv, tv_id }: T) => {
  const { activeEP, setActiveEP } = useEpisodeStore();

  useEffect(() => {
    if (activeEP?.tv_id !== tv_id) setActiveEP(null);
  }, [activeEP, tv_id]);

  const getNextEp = (selectedEpisode: EpisodeType) => {
    if (!tv.seasons || !activeEP) return;

    const tvSeasons = tv.seasons.find(
      (season: TVSeason) => season.season === selectedEpisode.season
    );

    if (tvSeasons) {
      const episodeIndex = tvSeasons.episodes.findIndex(
        (episode: EpisodeType) => episode.id === selectedEpisode.id
      );
      if (episodeIndex !== -1 && episodeIndex < tvSeasons.episodes.length - 1) {
        setActiveEP(tvSeasons.episodes[episodeIndex + 1]);
      }
    }
  };
  return (
    <>
      {activeEP && activeEP.id ? (
        <>
          <Episode episodeNumber={activeEP.episode} seasonNumber={activeEP.season} episodeId={activeEP?.id} id={tv_id} type={"tv"} />
        </>
      ) : (
        ""
      )}
    </>
  );
};
