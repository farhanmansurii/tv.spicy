"use client";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import useTVShowStore from "@/store/recentsStore";
import { useEpisodeStore } from "@/store/episodeStore";
import { PlayIcon } from "@radix-ui/react-icons";
import { Check, Plus } from "lucide-react";
import { Show } from "@/lib/types";
import useWatchListStore from "@/store/watchlistStore";
interface ContinueWatchingButtonProps {
  id: string; // Adjust the type accordingly
  show: Show;
  type: string;
}
export default function ContinueWatchingButton(
  props: ContinueWatchingButtonProps
) {
  const { recentlyWatched, loadEpisodes } = useTVShowStore();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const {
    addToWatchlist,
    watchlist,
    removeFromWatchList,
    tvwatchlist,
    addToTvWatchlist,
    removeFromTvWatchList,
  } = useWatchListStore();
  let isAdded: boolean;
  if (props.type === "movie")
    isAdded = watchlist.some((show: any) => show.id === props.id);
  else isAdded = tvwatchlist.some((show: any) => show.id === props.id);
  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);
  const addToList = (show: Show) => {
    console.log(props.type)
    if (!isAdded) {
      if (props.type === "movie") {
        addToWatchlist(show);
      } else {
        addToTvWatchlist(show);
      }
    } else {
      if (props.type === "movie") {
        removeFromWatchList(show.id);
      } else {
        removeFromTvWatchList(show.id);
      }
    }
  };

  const recentlyWatchedEpisode = recentlyWatched.find(
    (episode: any) => episode.tv_id === props.id
  );

  const renderWatchButton = () => {
    if (!recentlyWatchedEpisode) {
      return (
        <Button
          onClick={() => addToList(props.show)}
          className="flex gap-2 w-full lg:w-[300px]"
        >
          {isAdded ? (
            <>
              <Check size="sm" className="w-5 h-5" /> Added
            </>
          ) : (
            <>
              <Plus size="sm" className="w-5 h-5" /> Add to Watchlist
            </>
          )}
        </Button>
      );
    }

    if (recentlyWatchedEpisode.episode !== activeEP?.episode) {
      return (
        <div className="flex gap-2">
          <Button
            className="flex gap-2 w-[300px] "
            onClick={() => setActiveEP(recentlyWatchedEpisode)}
          >
            <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5">
              <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z" />
            </svg>
            Play Season {recentlyWatchedEpisode.season} Episode{" "}
            {recentlyWatchedEpisode?.episode}
          </Button>
          <Button
            onClick={() => addToList(props.show)}
            className="flex gap-2 w-fit"
          >
            {isAdded ? (
              <Check size="sm" className="w-5 h-5" />
            ) : (
              <Plus size="sm" className="w-5 h-5" />
            )}
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={() => addToList(props.show)}
        className="flex gap-2 w-[300px]"
      >
        {isAdded ? (
          <>
            <Check size="sm" className="w-5 h-5" /> Added
          </>
        ) : (
          <>
            <Plus size="sm" className="w-5 h-5" /> Add to Watchlist
          </>
        )}
      </Button>
    );
  };

  return <div className="flex gap-2">{renderWatchButton()}</div>;
}
