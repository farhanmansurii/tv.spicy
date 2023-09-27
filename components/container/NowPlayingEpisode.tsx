import { fetchMovieLinks } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import React from "react";
import OPlayer from "../common/Player";

export default async function NowPlayingEpisode(props) {
  const { data } = props;
  const searchParams = useSearchParams();
  const search = searchParams.get("episodeId");
  if (!search || !data) return  <div>Select Episode</div>;
  // const episode = await fetchMovieLinks(search, data.id);
  return (
    <div>
      {data?.id}
      {search}

      {/* {episode && <OPlayer sources={episode.sources} subtitles={episode.subtitles}/>} */}
    </div>
  );
}
