import AnimeDetailsWrapper from "@/components/container/anime-container.tsx/anime-detail/anime-details-wrapper";
import { fetchData } from "@/lib/anime-helpers";
import { notFound } from "next/navigation";
import React from "react";

export default async function AnimePage({
  params,
}: {
  params: { anime: string };
}) {
  const anime = await fetchData(`data/${params.anime}`);
  console.log(anime);
  if (!anime) return notFound();
  return <AnimeDetailsWrapper anime={anime} key={params.anime} />;
}
