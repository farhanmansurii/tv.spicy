import Details from "@/components/common/Details";
import { fetchDetails } from "@/lib/utils";
import React from "react";

export default async function TVDetails({
  params,
}: {
  params: { tv: string };
}) {
  const data = await fetchDetails(params.tv, "tv");

  if (!data) return <div>Loadimg</div>;
  return (
    <div>
      <Details data={data} type={"tv"} />
    </div>
  );
}
