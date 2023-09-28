"use client";
import useTVShowStore from "@/store/recentsStore";
import Link from "next/link";
import React, { useEffect } from "react";

const RecentlyWatched = () => {
  const { loadRecentlyWatched, recentlyWatched } = useTVShowStore();

  useEffect(() => {
    loadRecentlyWatched();
  }, []);
  return (
    <div>
     
    </div>
  );
};

export default RecentlyWatched;
