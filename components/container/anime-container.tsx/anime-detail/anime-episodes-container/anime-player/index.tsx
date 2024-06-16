"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLinks } from "@/lib/anime-helpers";
import { AnimeEpisode } from "@/lib/types";
import { useParams } from "next/navigation";
import React from "react";
import OPlayer from "./player";
import { Skeleton } from "@/components/ui/skeleton";
import { Image } from "lucide-react";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function AnimePlayer({
  id,
  episode,
}: {
  id: string;
  episode: AnimeEpisode;
}) {
  const {
    data: links,
    isLoading: linksLoading,
    isError: linksError,
  } = useQuery({
    queryKey: ["anime-episode-links", id],
    queryFn: async () => id && (await fetchLinks(id)),
    enabled: !!id,
  });
  if (!id) return;

  if (linksLoading) {
    return <Skeleton className="aspect-video w-full mx-auto" />;
  }

  if (linksError) {
    return (
      <div className="w-full h-[200px] mx-auto  border rounded-lg bg-muted flex-col gap-3 border-3 text-lg items-center justify-center flex text-center ">
        <Cross2Icon className="w-14 h-14 p-1" />
        <h1 className="text-2xl font-bold">
          There was a problem try again later
        </h1>
      </div>
    );
  }

  return (
    <OPlayer
      malId={id}
      handleNextEpisode={() => ""}
      key={id}
      episode={episode}
      animeID={id}
      sources={links.sources}
    />
  );
}
