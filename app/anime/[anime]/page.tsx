import AnimeDetailsWrapper from "@/components/container/anime-container.tsx/anime-detail/anime-details-wrapper";
import { fetchData } from "@/lib/anime-helpers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
export const generateMetadata = async (props: any): Promise<Metadata> => {
  const params = await props.params;

  const {
    anime
  } = params;

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
export default async function AnimePage(
  props: {
    params: Promise<{ anime: string }>;
  }
) {
  const params = await props.params;
  const anime = await fetchData(`data/${params.anime}`);
  if (!anime) return notFound();
  return <AnimeDetailsWrapper anime={anime} key={params.anime} />;
}
