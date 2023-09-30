"use client";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import useTVShowStore from "@/store/recentsStore";
import { useEpisodeStore } from "@/store/episodeStore";
import { PlayIcon } from "@radix-ui/react-icons";
import { Plus } from "lucide-react";

export default function ContinueWatchingButton(props: any) {
  const { recentlyWatched } = useTVShowStore();
  const { activeEP, setActiveEP } = useEpisodeStore();
  const recentlyWatchedEpisode = recentlyWatched.find(
    (episode:any) => episode.tv_id === props.id
  );


  return (
    <div className="flex gap-2">
      {recentlyWatchedEpisode ? (
        recentlyWatchedEpisode.episode !== activeEP?.episode ? (
          <div className="flex gap-2">
            <Button
              className="flex gap-2 lg:w-[300px] w-full"
              onClick={() => setActiveEP(recentlyWatchedEpisode)}
            >
              <svg
                fill="currentColor"
                viewBox="0 0 16 16"
                height="1.2rem"
                width="1.2rem"
              >
                <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
              </svg>
              Play Season {recentlyWatchedEpisode.season} Episode{" "}
              {recentlyWatchedEpisode?.episode}
            </Button>
            <Button className="flex gap-2 w-fit">
              <Plus size="sm" className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button className="flex gap-2 w-full lg:w-[300px]">
            <Plus size="sm" className="w-5 h-5" /> Add to Watchlist
          </Button>
        )
      ) : (
        <Button className="flex gap-2 w-full lg:w-[300px]">
          <Plus size="sm" className="w-5 h-5" /> Add to Watchlist
        </Button>
      )}
    </div>
  );
}
