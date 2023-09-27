"use client";
import { useEpisodeStore } from "@/store/episodeStore";
import React from "react";

export default function EpisodeCard(props: any) {
  const { episode,id } = props;
  const { activeEP, setActiveEP } = useEpisodeStore();
  return (
    <div
      key={episode.id}
      onClick={() => setActiveEP({tv_id:id,...episode})}
      className={`flex justify-between hover:bg-primary rounded p-1 cursor-pointer flex-row gap-2 items-center ${activeEP.id===episode.id ? 'bg-primary':''} `}
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
