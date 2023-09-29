"use client";
import React, { useEffect, useState, useMemo } from "react";
import OPlayer from "../common/Player";
import { fetchMovieLinks } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

export default function Episode(props: any) {
  const { episodeId, id, type, next } = props;
  const [episode, setEpisode] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useMemo(
    () => async () => {
      try {
        const episodeData = await fetchMovieLinks(episodeId, id);
        setEpisode(episodeData);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error("Error fetching episode data:", error);
        setError("Error playing episode :/");
      }
    },
    [episodeId, id]
  );
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="aspect-video items-center flex justify-center bg-secondary rounded-lg w-full lg:w-[600px] mx-auto my-4">
        {error}
      </div>
    );
  }
  if (!episode) {
    return (
      <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
    );
  }
  return (
    <OPlayer
      sources={episode.sources}
      subtitles={episode.subtitles}
      type={type}
    />
  );
}
