import { fetchMovieLinks } from "@/lib/utils";
import React from "react";
import OPlayer from "../common/Player";

export default async function Episode(props: any) {
  const { episodeId, id, type,next } = props;
  const episode = await fetchMovieLinks(episodeId, id);
  if (!episode)
    return (
      <div className="aspect-video w-full lg:w-[600px]  mx-auto my-4" 
      >
        Error playing episode :/
      </div>
    );
  return (
      <OPlayer
        sources={episode.sources}
        subtitles={episode.subtitles}
        type={type}
        key={episode.sources[0]}
      />
  );
}
