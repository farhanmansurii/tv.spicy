"use client";
import React, { useEffect } from "react";
import Episode from "../container/Episode";
import { useEpisodeStore } from "@/store/episodeStore";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";

interface T {
  tv: any;
  tv_id: string;
}

interface EpisodeType {
  [x: string]: number;
  id: any;
  season: number;
}

interface TVSeason {
  season: number;
  episodes: EpisodeType[];
}

export const TVContainer: React.FC<T> = ({ tv, tv_id }: T) => {
  const { activeEP, setActiveEP } = useEpisodeStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const seasonParam = searchParams.get("season");
    const episodeParam = searchParams.get("episode");

    if (seasonParam && episodeParam) {
      const seasonNumber = parseInt(seasonParam);
      const episodeNumber = parseInt(episodeParam);

      const season = tv.seasons.find(
        (season: TVSeason) => season.season === seasonNumber
      );
      if (season) {
        const episode = season.episodes.find(
          (ep: EpisodeType) => ep.episode === episodeNumber
        );
        if (episode) {
          setActiveEP(episode);
        }
      }
    } else if (activeEP?.tv_id !== tv_id) {
      setActiveEP(null);
    }
  }, [activeEP, tv_id, searchParams, setActiveEP, tv.seasons]);

  const getNextEp = () => {
    if (!tv.seasons || !activeEP) return;

    const currentSeasonIndex = tv.seasons.findIndex(
      (season: TVSeason) => season.season === activeEP.season
    );

    if (currentSeasonIndex !== -1) {
      const tvSeasons = tv.seasons[currentSeasonIndex];
      const episodeIndex = tvSeasons.episodes.findIndex(
        (episode: EpisodeType) => episode.id === activeEP.id
      );

      if (episodeIndex !== -1 && episodeIndex < tvSeasons.episodes.length - 1) {
        const nextEpisode = tvSeasons.episodes[episodeIndex + 1];
        setActiveEP(nextEpisode);
        const params = new URLSearchParams(window.location.search);
        params.set("season", String(nextEpisode.season));
        params.set("episode", String(nextEpisode.episode));
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params.toString()}`
        );
      } else if (currentSeasonIndex < tv.seasons.length - 1) {
        const nextSeason = tv.seasons[currentSeasonIndex + 1];
        if (nextSeason.episodes && nextSeason.episodes.length > 0) {
          const firstEpisode = nextSeason.episodes[0];
          setActiveEP(firstEpisode);
          const params = new URLSearchParams(window.location.search);
          params.set("season", String(firstEpisode.season));
          params.set("episode", String(firstEpisode.episode));
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${params.toString()}`
          );
        }
      }
    }
  };

  return (
    <div className="mx-auto my-8 max-w-4xl space-y-8 px-2 md:space-y-12 md:px-0">
      {activeEP && activeEP.id ? (
        <Episode
          episodeNumber={activeEP.episode}
          seasonNumber={activeEP.season}
          episodeId={activeEP?.id}
          id={tv_id}
          getNextEp={getNextEp}
          key={activeEP.episode}
          type={"tv"}
        />
      ) : (
        ""
      )}
    </div>
  );
};
