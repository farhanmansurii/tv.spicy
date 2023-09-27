import { fetchMovieLinks } from "@/lib/utils";
import React from "react";
import OPlayer from "../common/Player";

export default async function Episode({ data }: any) {
  const episode = await fetchMovieLinks(data.episodeId, data.id);
  if (!episode)
    return (
      <div
        className="flex items-center
       justify-center animate-pulse rounded-md bg-secondary/70  text-2xl aspect-video w-full lg:w-[600px]  mx-auto my-4"
      > Error
      </div>
    );
  return (
    <div>
      <OPlayer sources={episode.sources} subtitles={episode.subtitles} />
    </div>
  );
}
