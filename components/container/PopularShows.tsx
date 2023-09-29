import { getNewAndPopularShows } from "@/lib/utils";
import React from "react";
import Row from "./Row";

export default async function PopularShows() {
  const allShows = await getNewAndPopularShows();

  const allShowsByCategory: any[] = [
    {
      title: "Top TV Shows",
      shows: allShows.topRatedTV,
      type: "tv",
    },
    {
      title: "Top Movies",
      shows: allShows.topRatedMovie,
      type: "movie",
    },
    {
      title: "Trending TV Shows",
      shows: allShows.trendingTv,
      type: "tv",
    },
    {
      title: "Trending Movies",
      shows: allShows.trendingMovie,
      type: "movie",
    },
  ];
  return (
    <div className="w-11/12 mx-auto">
      {allShowsByCategory.map((category) => (
        <Row key={category.title} text={category.title} type={category.type} shows={category.shows} />
      ))}
    </div>
  );
}
