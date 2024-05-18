import React from "react";
import FetchAndRenderRow from "./FetchAndRenderRow";
import WatchList from "../common/WatchList";

export default function RowContainer() {
  return (
    <div className="flex flex-col gap-[2rem]">
      <WatchList />
      <FetchAndRenderRow
        apiEndpoint="movie/top_rated"
        text="Top Rated Movies"
        showRank={true}
        type="movie"
      />
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
