import React from "react";
import FetchAndRenderRow from "./FetchAndRenderRow";
import WatchList from "../common/WatchList";
import AnimeRow from "./anime-container.tsx/anime-row-wrapper";
import AnimeRowContainer from "./anime-container.tsx/anime-row-wrapper";

export default function RowContainer() {
  return (
    <div className="flex flex-col space-y-12">
      <WatchList />
      <FetchAndRenderRow
        apiEndpoint="movie/top_rated"
        text="Top Rated Movies"
        showRank={true}
        type="movie"
      />
      {/* <AnimeRowContainer
        text="Trending"
        endpoint={`advanced-search?sort=["FAVOURITES_DESC"]`}
      /> */}
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
