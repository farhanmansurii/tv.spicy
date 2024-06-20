import Details from "@/components/common/Details";
import { Header } from "@/components/common/header";
import { fetchDetails, fetchDetailsTMDB } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
export const generateMetadata = async ({
  params: { tv },
}: any): Promise<Metadata> => {
  try {
    const data = await fetchDetailsTMDB(tv, "tv");
    return {
      title: `${data?.name || data?.title}`,
      description: data.overview,
    };
  } catch (e) {
    return {
      title: "TV Show",
      description: "Desc",
    };
  }
};
export default async function TVDetails({
  params,
}: {
  params: { tv: string };
}) {
  const tmdb = await fetchDetailsTMDB(params.tv, "tv");
  if (!tmdb) return notFound();
  return <Details data={tmdb} id={params.tv} type={"tv"} />;
}
