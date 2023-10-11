"use client";
import React, { Suspense, useEffect } from "react";
import Episode from "../container/Episode";
import useTVShowStore from "@/store/recentsStore";
import { useEpisodeStore } from "@/store/episodeStore";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface T {
  tv: any;
  tv_id: string;
}
export const TVContainer: React.FC<T> = ({ tv, tv_id }: T) => {
  const { activeEP, setActiveEP } = useEpisodeStore();
  console.log(activeEP)
  return (
    <>
      {activeEP.id ? (
        <Episode episodeId={activeEP.id} id={tv.id} type={"tv"} />
      ) : (
        ""
      )}
    </>
  );
};
