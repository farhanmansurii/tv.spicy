import Details from "@/components/common/Details";
import MinimalSocialsFooter from "@/components/common/Footer";
import { fetchDetails, fetchDetailsTMDB } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
export const generateMetadata = async ({
  params: { movie },
}: any): Promise<Metadata> => {
  try {
    const data = await fetchDetailsTMDB(movie, "movie");
    return {
      title: `${data?.name || data?.title}`,
      description: data.overview,
    };
  } catch (e) {
    return {
      title: "Movie",
      description: "Desc",
    };
  }
};
export default async function TVDetails({
  params,
}: {
  params: { movie: string };
}) {
  const { movie } = params;
  const data = await fetchDetailsTMDB(movie, "movie");
  if (!data) return notFound();
  return <Details data={data} type={"movie"} />;
}
