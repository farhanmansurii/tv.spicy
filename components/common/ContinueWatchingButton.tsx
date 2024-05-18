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
    <div className="flex gap-2">
      <Button onClick={handleAddOrRemove}>
        {isAdded ? (
          <>
            <Check className="w-7 h-7 p-1" /> Added
          </>
        ) : (
          <>
            <Plus className="w-7 h-7 p-1" />
            Add to Up Next
          </>
        )}
      </Button>
      {!isEpisodeActive && recentlyWatchedEpisode && (
        <Button onClick={() => setActiveEP(recentlyWatchedEpisode)}>
          <PlayIcon className="w-5 h-5" />
          Play S{recentlyWatchedEpisode.season} E
          {recentlyWatchedEpisode.episode}
        </Button>
      )}
    </div>
  );
}
