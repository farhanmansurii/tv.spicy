import Details from "@/components/common/Details";
import { fetchDetails } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";
export default async function TVDetails({
  params,
}: {
  params: { movie: string };
}) {
  const { movie } = params;
  const data = await fetchDetails(movie, "movie");

  if (!data) return notFound()
  return (
    <div>
      <Details data={data} type={"movie"} />
    </div>
  );
}
