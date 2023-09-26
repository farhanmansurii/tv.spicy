// 'use client'
import { fetchMovieLinks } from "@/lib/utils";
import React from "react";
import OPlayer from "../common/Player";

export default async function Episode({ data }: any) {
  const episode = await fetchMovieLinks(data.episodeId, data.id);
  return (
    <div>
      <OPlayer sources={episode.sources} subtitles={episode.subtitles} />
    </div>
  );
}
