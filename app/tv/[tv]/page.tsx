import Details from "@/components/common/Details";
import { Header } from "@/components/common/header";
import { fetchDetails, fetchDetailsTMDB } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";

export default async function TVDetails({
  params,
}: {
  params: { tv: string };
}) {
  const tmdb = await fetchDetailsTMDB(params.tv, "tv");
  if (!tmdb) return notFound();
  return <Details data={tmdb} id={params.tv} type={"tv"} />;
}
