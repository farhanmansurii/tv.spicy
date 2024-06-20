import CarousalComponent from "@/components/common/CarousalComponent";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import FetchAndRenderRow from "@/components/container/FetchAndRenderRow";
import GenreGrid from "@/components/genre-card/genre-grid";
import RowLoader from "@/components/loading/RowLoader";
import { fetchGenres } from "@/lib/utils";
import { Metadata } from "next";
import React, { Suspense } from "react";
export const metadata: Metadata = {
  title: "Movies | Watvh TV",
  description: "Watch any TV / Movies / Anime with Watvh ",
};
export default async function page() {
  const genres = await fetchGenres("movie");
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 lg:px-0">
      <CarousalComponent type={"movie"} />
      <div className="flex flex-col space-y-12">
        <WatchList type="movie" />
        <FetchAndRenderRow
          apiEndpoint="trending/movie/week"
          text="Top Movies"
          showRank={false}
          type="movie"
        />
        <FetchAndRenderRow
          apiEndpoint="movie/top_rated"
          text="Top Rated Movies"
          showRank={true}
          type="movie"
        />
        {genres &&
          genres.map((genre: any) => (
            <Suspense
              key={genre.id}
              fallback={<RowLoader withHeader key={genre.id} />}
            >
              <FetchAndRenderRow
                showRank={false}
                type="movie"
                apiEndpoint={{ id: genre.id, type: "movie" }}
                text={genre.name}
                isGenre={true}
              />
            </Suspense>
          ))}
      </div>
      <GenreGrid genres={genres} type="movie" />
    </div>
  );
}
