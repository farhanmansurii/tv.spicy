import AnimeDetailsWrapper from "@/components/container/anime-container.tsx/anime-detail/anime-details-wrapper";
import { fetchData } from "@/lib/anime-helpers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
export const generateMetadata = async ({
  params: { anime },
}: any): Promise<Metadata> => {
  try {
    const data = await fetchData(`data/${anime}`);
    return {
      title: `${data.title.userPreferred || data.title.english}`,
      description: data.description,
    };
  } catch (e) {
    return {
      title: "Anime",
      description: "Desc",
    };
  }
};
export default async function AnimePage({
  params,
}: {
  params: { anime: string };
}) {
  const anime = await fetchData(`data/${params.anime}`);
  if (!anime) return notFound();
  return <AnimeDetailsWrapper anime={anime} key={params.anime} />;
}
