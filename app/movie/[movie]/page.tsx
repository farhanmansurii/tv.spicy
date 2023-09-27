import Details from "@/components/common/Details";
import { fetchDetails } from "@/lib/utils";
import React from "react";
export default async function TVDetails({
  params,
}: {
  params: { movie: string };
}) {
  const { movie } = params;
  const data = await fetchDetails(movie, "movie");

  if (!data) return <div>Loadimg</div>;
  return (
    <div>
      <Details data={data} type={"movie"} />
    </div>
  );
}
