import Details from "@/components/common/Details";
import { fetchDetails, fetchDetailsTMDB } from "@/lib/utils";
import React from "react";
export default async function TVDetails({
  params,
}: {
  params: { movie: string };
}) {
  const { movie } = params;
  const data = await fetchDetailsTMDB(movie, "movie");
  if (!data) return <div>Loading</div>;
  return (
    <div>
      <Details data={data} type={"movie"} />
    </div>
  );
}
