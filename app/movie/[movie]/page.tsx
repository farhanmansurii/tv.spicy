import Details from "@/components/common/Details";
import { fetchMovie, fetchMovieLinks } from "@/lib/utils";
import dynamic from "next/dynamic";
import React from "react";
export default async function TVDetails({
  params,
}: {
  params: { movie: string };
}) {
  const { movie } = params;
  const data = await fetchMovie(movie);

  if (!data) return <div>Loadimg</div>;
  return (
    <div>
      <Details data={data} />
    </div>
  );
}
