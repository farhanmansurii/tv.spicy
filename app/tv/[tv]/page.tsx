import Details from "@/components/common/Details";
import MinimalSocialsFooter from "@/components/common/Footer";
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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <Details data={tmdb} id={params.tv} type={"tv"} />
      <MinimalSocialsFooter />
    </div>
  );
}
