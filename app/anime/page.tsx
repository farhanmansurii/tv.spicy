"use client";
import CarousalComponent from "@/components/common/CarousalComponent";
import CarousalCardWrapper from "@/components/common/DetailsCard";
import AnimeCarousal from "@/components/container/anime-container.tsx/anime-detail/anime-carousal";
import AnimeRowContainer from "@/components/container/anime-container.tsx/anime-row-wrapper";
import { fetchData } from "@/lib/anime-helpers";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function page() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 lg:px-0">
      <AnimeCarousal />
      <div className="flex flex-col space-y-12">
        <AnimeRowContainer text="Trending Anime" endpoint="trending" />
        <AnimeRowContainer text="Popular Anime" endpoint="popular" />
      </div>
    </div>
  );
}
