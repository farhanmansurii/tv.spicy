"use client";
import { useEpisodeStore } from "@/store/episodeStore";
import useTVShowStore from "@/store/recentsStore";
import { Play } from "lucide-react";
import React from "react";

export default function EpisodeCard(props: any) {
  const { episode, id, tv_id } = props;
  const { activeEP, setActiveEP } = useEpisodeStore();
  const { addRecentlyWatched } = useTVShowStore();
  const toggle = () => {
    setActiveEP({ tv_id: tv_id, ...episode });
    addRecentlyWatched({ tv_id: tv_id, ...episode });
    console.log(activeEP);
  };

  return (
    <div
      key={episode.id}
      onClick={() => toggle()}
      className={`flex justify-between  rounded p-1 cursor-pointer flex-row gap-2 items-center ${
        activeEP.id === episode.id && "bg-primary"
      } `}
    >
      <div className="w-[300px]  h-[130px] relative">
        <img
          className="rounded w-full h-full object-cover"
          src={episode.img?.mobile || episode.img?.hd}
          alt={episode.title}
        />{" "}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          >
            <Play fill="white" className="w-10 h-10 shadow-2xl" />
          </button>
        </div>
      </div>
      <div className="w-full flex  flex-col  text-sm">
        <div className="text-[10px] text-gray-100/50">
          Episode {episode.episode}
        </div>
        <div className="font-bold">{episode.title}</div>
        <div className="text-[10px] md:text-xs opacity-50 leading-tight line-clamp-2">
          {episode.description}
        </div>
      </div>
    </div>
  );
}
