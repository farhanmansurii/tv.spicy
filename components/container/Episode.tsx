"use client";
import React, { useEffect, useState } from "react";
import OPlayer from "../common/Player";
import { fetchMovieLinks } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { RotateCw, XCircle } from "lucide-react";

interface EpisodeProps {
  episodeId: string;
  id: string;
  type: string;
}

interface EpisodeData {
  sources: string[];
  subtitles: string[];
}

export default function Episode(props: EpisodeProps) {
  const { episodeId, id, type } = props;
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  async function fetchData() {
    setIsLoading(true);
    try {
      const episodeData = await fetchMovieLinks(episodeId, id);
      setEpisode(episodeData);
      setError(null);
      console.log("fetched");
    } catch (error) {
      console.error("Error fetching episode data:", error);
      setError("Error playing episode :/");
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, [episodeId, id]);

  if (error) {
    return (
      <div className="aspect-video gap-2 text-xl flex-col items-center flex justify-center bg-secondary rounded-lg w-full lg:w-[600px] mx-auto my-4">
        <div> {error || "Something went wrong"} :/</div>
        <Button
          className="bg-primary text-sm gap-2 text-white"
          onClick={() => fetchData()}
        >
          Retry <RotateCw className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Skeleton className="aspect-video w-full lg:w-[600px]  mx-auto my-4" />
    );
  }

  if (!episode) {
    return (
      <div className="aspect-video gap-2 text-xl flex-col items-center flex justify-center bg-secondary rounded-lg w-full lg:w-[600px] mx-auto my-4">
      <div> { "Something went wrong"} :/</div>
      <Button
        className="bg-primary text-sm gap-2 text-white"
        onClick={() => fetchData()}
      >
        Retry <RotateCw className="w-4 h-4" />
      </Button>
    </div>
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
