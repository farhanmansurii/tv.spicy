"use client";
import { useEpisodeStore } from "@/store/episodeStore";
import useTVShowStore from "@/store/recentsStore";
import React from "react";

export default function EpisodeCard(props: any) {
  const { episode, id } = props;
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { addToRecentlyWatched } = useTVShowStore();
  const toggle = () => {
    setActiveEP({ tv_id: id, ...episode });
    addToRecentlyWatched({ tv_id: id, ...episode });
  };
  return (
    <div
      key={episode.id}
      onClick={() => toggle()}
      className={`flex justify-between hover:bg-primary/20 rounded p-1 cursor-pointer flex-row gap-2 items-center ${
        activeEP.id === episode.id ? "bg-primary" : ""
      } `}
    >
      <div className="w-[250px]  h-full">
        <img
          className="rounded"
          src={episode.img?.mobile || episode.img?.hd}
          alt={episode.title}
        />
      </div>
      <div className="w-full text-sm">
        <div className="font-bold">{episode.title}</div>
        <div className="text-[10px] md:text-xs leading-tight line-clamp-2">
          {episode.description}
        </div>
      </div>
    </div>
  );
}
