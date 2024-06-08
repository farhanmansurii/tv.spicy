"use client";
import React, { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import Episode from "../container/Episode";
import SeasonTabs from "../container/Seasons";
import { fetchDetails, fetchMovieLinks } from "@/lib/utils";
import { TVContainer } from "./TVContainer";
import RowLoader from "../loading/RowLoader";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import SeasonsTabLoader from "../container/SeasonsTabLoader";

interface ShowContainerProps {
  type: string;
  id: string;
}

const ShowContainer: React.FC<ShowContainerProps> = ({ type, id }) => {
  const {
    data: showData,
    isLoading: showDataLoading,
    isError: showDataError,
  } = useQuery({
    queryKey: ["showData", id, type],
    queryFn: async () => await fetchDetails(id, type),
  });
  const {
    data: streamingLinks,
    isLoading: streamingLinksLoading,
    isError: streamingLinksError,
  } = useQuery({
    queryKey: ["profile", showData?.id],
    queryFn: async () => {
      try {
        const res = await new Promise((resolve, reject) => {
          fetchMovieLinks(id, showData.id, (err: any, res: any) => {
            if (err) reject(err);
            resolve(res);
          });
        });
        return res;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    enabled: type === "movie",
  });
  if (showDataError) return notFound();

  return (
    <div className="w-[96%] flex mx-auto items-center gap-10 flex-col">
      {type === "tv" ? (
        showDataLoading ? (
          <SeasonsTabLoader />
        ) : (
          <div className="w-full">
            <TVContainer tv={showData} tv_id={id} />
            <SeasonTabs
              seasons={showData.seasons}
              id={showData.id}
              tv_id={id}
            />
          </div>
        )
      ) : (
        <div className="w-[96%] aspect-video lg:w-[640px] mx-auto my-4">
          {showDataLoading ? (
            <Skeleton />
          ) : (
            <Episode
              episodeId={showData.episodeId}
              id={showData.id}
              movieID={id}
              type={type}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ShowContainer;
