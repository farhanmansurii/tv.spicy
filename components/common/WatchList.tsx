"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Show } from "@/lib/types";
import { CaretRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ShowCard from "../common/Card";
import useWatchListStore from "@/store/watchlistStore";
import Row from "../container/Row";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function WatchList({ type }: { type: string }) {
  const { watchlist, clearTVWatchlist, clearWatchlist, tvwatchlist } =
    useWatchListStore();

  return (
    <div className="space-y-12">
      {(type === "movie" || type === "all") && watchlist?.length > 0 && (
        <Row
          isVertical={false}
          text={"Movie Watchlist"}
          shows={watchlist}
          type={"movie"}
          showRank={false}
        />
      )}

      {(type === "tv" || type === "all") && tvwatchlist?.length > 0 && (
        <Row
          isVertical={false}
          text={"TV Watchlist"}
          shows={tvwatchlist}
          type={"tv"}
          showRank={false}
        />
      )}
    </div>
  );
}
