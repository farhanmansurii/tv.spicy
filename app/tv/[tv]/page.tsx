import Details from "@/components/common/Details";
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
  return (
    <div>
      <Details data={tmdb} type={"tv"} />
    </div>
  );
}
