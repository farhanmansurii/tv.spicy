"use client";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import useTVShowStore from "@/store/recentsStore";
import { useEpisodeStore } from "@/store/episodeStore";
import { Check, PlayIcon, Plus } from "lucide-react";
import { Episode, Show } from "@/lib/types";
import useWatchListStore from "@/store/watchlistStore";

interface ContinueWatchingButtonProps {
  id: any;
  show: Show;
  type: string;
}

export default function ContinueWatchingButton({
  id,
  show,
  type,
}: ContinueWatchingButtonProps) {
  const { recentlyWatched, loadEpisodes } = useTVShowStore();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const {
    addToWatchlist,
    removeFromWatchList,
    addToTvWatchlist,
    removeFromTvWatchList,
    watchlist,
    tvwatchlist,
  } = useWatchListStore();

  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);

  const isAdded =
    type === "movie"
      ? watchlist.some((s) => s.id === id)
      : tvwatchlist.some((s) => s.id === id);

  const handleAddOrRemove = () => {
    if (isAdded) {
      type === "movie" ? removeFromWatchList(id) : removeFromTvWatchList(id);
    } else {
      type === "movie" ? addToWatchlist(show) : addToTvWatchlist(show);
    }
  };

  const recentlyWatchedEpisode = recentlyWatched.find(
    (episode: any) => episode.tv_id === id
  );
  const isEpisodeActive = recentlyWatchedEpisode?.episode === activeEP?.episode;

  return (
    <div className="flex w-full flex-col md:flex-row md:w-fit gap-2">
      <Button className=" whitespace-nowrap" onClick={handleAddOrRemove}>
        {isAdded ? (
          <>
            <Check className="w-7 h-7 p-1" /> Added
          </>
        ) : (
          <>
            <Plus className="w-7 h-7 p-1" />
            Add
          </>
        )}
      </Button>
      {!isEpisodeActive && recentlyWatchedEpisode && (
        <Button
          variant={"secondary"}
          className="whitespace-nowrap px-4 w-full"
          onClick={() => setActiveEP(recentlyWatchedEpisode)}
        >
          <svg fill="currentColor" viewBox="0 0 16 16" className="w-7 h-7 p-1">
            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
          </svg>
          Play S{recentlyWatchedEpisode.season} E
          {recentlyWatchedEpisode.episode}
        </Button>
      )}
    </div>
  );
}
