"use client";
import { Separator } from "@/components/ui/separator";
import React from "react";
import AnimeDetails from "./anime-details-component";
import { Anime } from "@/lib/types";
import AnimeRowContainer from "../anime-row-wrapper";
import dynamic from "next/dynamic";
import SeasonsTabLoader from "../../SeasonsTabLoader";
import MoreDetailsContainer from "../../MoreDetailsContainer";
import { Metadata } from "next";
import AnimeRow from "../anime-row";
const AnimeEpisodesContainer = dynamic(
  () => import("./anime-episodes-container"),
  {
    ssr: true,
    loading: () => <SeasonsTabLoader />,
  }
);

export const generateMetadata = ({ anime }: { anime: Anime }): Metadata => {
  return {
    applicationName: anime.title.userPreferred || anime.title.english,
    description: anime.description,
  };
};
export default function AnimeDetailsWrapper({ anime }: { anime: Anime }) {
  const renderContent = (selected: string) => {
    switch (selected) {
      case "Recommendations":
        return (
          <AnimeRow
            key={selected}
            type="tv"
            anime={anime?.recommendations as any[]}
            isVertical={true}
          />
        );
      case "Related Shows":
        return (
          <AnimeRow
            key={selected}
            type="tv"
            anime={anime?.relations as any[]}
            isVertical={true}
          />
        );
      default:
        return <div>No Content</div>;
    }
  };
  return (
    <div className="max-w-6xl w-full space-y-10  mx-auto">
      <AnimeDetails id={anime?.id} anime={anime} />
      <Separator className="max-w-4xl w-full  mx-auto" />
      <AnimeEpisodesContainer id={anime.id} />
      <Separator className="max-w-4xl w-full  mx-auto" />
      <MoreDetailsContainer
        type={"anime"}
        show={anime}
        renderContent={renderContent}
      />
      {/* <div className="mx-auto  max-w-4xl space-y-8 px-4 md:space-y-12 md:px-0">
        <AnimeRow anime={anime.recommendations as Anime[]} isVertical={true} />
      </div> */}
    </div>
  );
}
