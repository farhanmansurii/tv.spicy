import { BackgroundGradient } from "@/components/common/BackgroundGradient";
import CarousalComponent from "@/components/common/CarousalComponent";
import RecentlyWatchedTV from "@/components/common/RecentlyWatched";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import FetchAndRenderRow from "@/components/container/FetchAndRenderRow";
import RowContainer from "@/components/container/RowContainer";
import GenreGrid from "@/components/genre-card/genre-grid";
import RowLoader from "@/components/loading/RowLoader";
import { fetchGenres } from "@/lib/utils";
import { Metadata } from "next";
import React, { Suspense } from "react";
export const metadata: Metadata = {
  title: "Watvh TV",
  description: "Watch any TV / Movies / Anime with Watvh ",
};

export default async function page() {
  const genres = await fetchGenres("tv");
  return (
    <>
  <BackgroundGradient/>   <div className="mx-auto max-w-3xl space-y-4 px-4 lg:px-0">
        <CarousalComponent type={"tv"} />{" "}
        <div className="flex flex-col space-y-12">
          <RecentlyWatchedTV />
          <WatchList type="tv" />
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
          {genres &&
            genres.map((genre: any) => (
              <Suspense
                key={genre.id}
                fallback={<RowLoader withHeader key={genre.id} />}
              >
                <FetchAndRenderRow
                  showRank={false}
                  type="tv"
                  apiEndpoint={{ id: genre.id, type: "tv" }}
                  text={genre.name}
                  isGenre={true}
                />
              </Suspense>
            ))}
        </div>
      </div>
      {genres.length > 0 && <GenreGrid type="tv" genres={genres} />}
    </>
  );
}
