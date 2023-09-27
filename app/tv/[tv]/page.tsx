import Details from "@/components/common/Details";
import { fetchDetails } from "@/lib/utils";
import { notFound } from "next/navigation";
import React from "react";

export default async function TVDetails({
  params,
}: {
  params: { tv: string };
}) {
  const data = await fetchDetails(params.tv, "tv");

  if (!data) return notFound()
  return (
    <div>
      <Details data={data} type={"tv"} />
    </div>
  );
}
