import React from "react";
import FetchAndRenderRow from "./FetchAndRenderRow";
import WatchList from "../common/WatchList";
import AnimeRow from "./anime-container.tsx/anime-row-wrapper";
import AnimeRowContainer from "./anime-container.tsx/anime-row-wrapper";
import RecentlyWatched from "../common/RecentlyWatched";

export default function RowContainer() {
  return (
    <div className="flex flex-col space-y-12">
      <RecentlyWatched />
      <WatchList type="all" />
      <FetchAndRenderRow
        apiEndpoint="movie/top_rated"
        text="Top Rated Movies"
        showRank={true}
        type="movie"
      />
      <AnimeRowContainer text="Trending Anime" endpoint="trending" />
      <AnimeRowContainer text="Popular Anime" endpoint="popular" />
      <FetchAndRenderRow
        apiEndpoint="trending/tv/week"
        text="Top TV Shows"
        showRank={false}
        type="tv"
      />
      <FetchAndRenderRow
        apiEndpoint="tv/top_rated"
        text="Top Rated TV Shows"
        showRank={true}
        type="tv"
      />
      <FetchAndRenderRow
        apiEndpoint="trending/movie/week"
        text="Top Movies"
        showRank={false}
        type="movie"
      />
    </div>
  );
}
