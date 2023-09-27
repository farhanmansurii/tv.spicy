import { fetchMovieLinks } from "@/lib/utils";
import React from "react";
import OPlayer from "../common/Player";

export default async function Episode(props: any) {
  const { episodeId, id, type } = props;
  const episode = await fetchMovieLinks(episodeId, id);
  if (!episode)
    return (
      <div className="aspect-video w-full lg:w-[600px]  mx-auto my-4" 
      >
        Error playing episode :/
      </div>
    );
  return (
    <div>
      <OPlayer
        sources={episode.sources}
        subtitles={episode.subtitles}
        type={type}
      />
    </div>
  );
}
