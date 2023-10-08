"use client";
import useWatchListStore from "@/store/watchlistStore";
import React from "react";
import Row from "../container/Row";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function WatchList() {
  const { watchlist, clearTVWatchlist, clearWatchlist, tvwatchlist } =
    useWatchListStore();

  return (
    <>
      <div className="w-11/12 mx-auto">
        {watchlist?.length > 0 && (
          <Row
            text="Movies Watchlist"
            type="movie"
            shows={watchlist}
            action={clearWatchlist}
          />
        )}
        {tvwatchlist?.length > 0 && (
          <Row
            text="TV Watchlist"
            type="tv"
            shows={tvwatchlist}
            action={clearTVWatchlist}
          />
        )}
      </div>
    </>
  );
}
