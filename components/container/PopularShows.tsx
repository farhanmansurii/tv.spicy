import { getNewAndPopularShows } from "@/lib/utils";
import React from "react";
import Row from "./Row";

export default async function PopularShows() {
  const allShows = await getNewAndPopularShows();

  const allShowsByCategory: any[] = [
    {
      title: "New TV Shows",
      shows: allShows.popularTvs,
      type: "tv",
    },
    {
      title: "New Movies",
      shows: allShows.trendingMovies,
      type: "movie",
    },
    {
      title: "Popular TV Shows",
      shows: allShows.popularTvs,
      type: "tv",
    },
    {
      title: "Popular Movies",
      shows: allShows.popularMovies,
      type: "movie",
    },
  ];
  return (
    <div>
      {allShowsByCategory.map((category) => (
        <Row key={category.title} text={category.title} type={category.type} shows={category.shows} />
      ))}
    </div>
  );
}
