import { useEpisodeStore } from "@/store/episodeStore";
import useTVShowStore from "@/store/recentsStore";
import { Play } from "lucide-react";
import React from "react";

export default function EpisodeCard(props: any) {
  const { episode, active, toggle } = props;
  return (
    <div
      key={episode.id}
      onClick={() => toggle(episode)}
      className={`flex justify-between rounded cursor-pointer flex-row gap-2 items-center       
      ${active && "bg-muted"}
      `}
    >
      <div className="h-full w-[300px] aspect-video  drop drop-shadow-lg relative">
        <img
          className="  h-full  absolute inset-0 object-fill"
          src={episode.img?.mobile || episode.img?.hd}
          alt={episode.title}
        />{" "}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Play fill="white" className="w-10 h-10 shadow-2xl" />
        </div>
      </div>
      <div className="w-full flex  flex-col -gap-2  text-sm">
        <div className="text-[10px] text-accent-foreground/70">
          Episode {episode.episode}
        </div>
        <div className="font-bold">{episode.title}</div>
        {/* <div className="text-[10px] hidden md:block w-9/12 md:text-xs opacity-50  line-clamp-2">
          {episode.description}
        </div> */}
        <div className="w-full text-[10px] italic text-accent-foreground/70 text-end">
          {episode.releaseDate}
        </div>
      </div>
    </div>
  );
}
