"use client";
import { fetchGenres } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { Skeleton } from "../ui/skeleton";

interface ColorMapEntry {
  colSpan: number;
  bgColor: string;
  textColor: string;
  hoverColor: string;
}
const Genre = ({ name }: { name: string }) => {
  return (
    <div className="w-full gap-2  flex-col h-full uppercase p-2 text-3xl truncate rounded-lg flex items-center justify-center">
      {name?.split(" ")[0]}
      <ArrowRight className="w-12 h-12 rounded" />
    </div>
  );
};

const GenreGrid = ({ genres, type }: { genres: any; type: string }) => {
  const colorMap: { [key: number]: ColorMapEntry } = {
    0: {
      colSpan: 2,
      bgColor: "hover:text-red-900",
      hoverColor: "hover:bg-red-200",
      textColor: "bg-red-100",
    },
    1: {
      colSpan: 3,
      bgColor: "hover:text-blue-900",
      hoverColor: "hover:bg-blue-200",
      textColor: "bg-blue-100",
    },
    2: {
      colSpan: 5,
      bgColor: "hover:text-green-900",
      hoverColor: "hover:bg-green-200",
      textColor: "bg-green-100",
    },
    3: {
      colSpan: 6,
      bgColor: "hover:text-yellow-900",
      hoverColor: "hover:bg-yellow-200",
      textColor: "bg-yellow-100",
    },
    4: {
      colSpan: 2,
      bgColor: "hover:text-purple-900",
      hoverColor: "hover:bg-purple-200",
      textColor: "bg-purple-100",
    },
    5: {
      colSpan: 2,
      bgColor: "hover:text-pink-900",
      hoverColor: "hover:bg-pink-200",
      textColor: "bg-pink-100",
    },
    6: {
      colSpan: 4,
      bgColor: "hover:text-indigo-900",
      hoverColor: "hover:bg-indigo-200",
      textColor: "bg-indigo-100",
    },
    7: {
      colSpan: 6,
      bgColor: "hover:text-orange-900",
      hoverColor: "hover:bg-orange-200",
      textColor: "bg-orange-100",
    },
    8: {
      colSpan: 3,
      bgColor: "hover:text-teal-900",
      hoverColor: "hover:bg-teal-200",
      textColor: "bg-teal-100",
    },
    9: {
      colSpan: 2,
      bgColor: "hover:text-cyan-900",
      hoverColor: "hover:bg-cyan-200",
      textColor: "bg-cyan-100",
    },
    10: {
      colSpan: 5,
      bgColor: "hover:text-lime-900",
      hoverColor: "hover:bg-lime-200",
      textColor: "bg-lime-100",
    },
    11: {
      colSpan: 7,
      bgColor: "hover:text-rose-900",
      hoverColor: "hover:bg-rose-200",
      textColor: "bg-rose-100",
    },
    12: {
      colSpan: 3,
      bgColor: "hover:text-fuchsia-900",
      hoverColor: "hover:bg-fuchsia-200",
      textColor: "bg-fuchsia-100",
    },
    13: {
      colSpan: 5,
      bgColor: "hover:text-amber-900",
      hoverColor: "hover:bg-amber-200",
      textColor: "bg-amber-100",
    },
    14: {
      colSpan: 3,
      bgColor: "hover:text-violet-900",
      hoverColor: "hover:bg-violet-200",
      textColor: "bg-violet-100",
    },
    15: {
      colSpan: 2,
      bgColor: "hover:text-sky-900",
      hoverColor: "hover:bg-sky-200",
      textColor: "bg-sky-100",
    },
    16: {
      colSpan: 3,
      bgColor: "hover:text-emerald-900",
      hoverColor: "hover:bg-emerald-200",
      textColor: "bg-emerald-100",
    },
    17: {
      colSpan: 4,
      bgColor: "hover:text-red-900",
      hoverColor: "hover:bg-red-200",
      textColor: "bg-red-100",
    },
    18: {
      colSpan: 3,
      bgColor: "hover:text-blue-900",
      hoverColor: "hover:bg-blue-200",
      textColor: "bg-blue-100",
    },
    19: {
      colSpan: 1,
      bgColor: "hover:text-green-900",
      hoverColor: "hover:bg-green-200",
      textColor: "bg-green-100",
    },
  };

  return <div></div>;
};

export default GenreGrid;
const items = [
  {
    title: "The Dawn of Innovation",
    description: "Explore the birth of groundbreaking ideas and inventions.",
    header: <Skeleton />,
  },
  {
    title: "The Digital Revolution",
    description: "Dive into the transformative power of technology.",
    header: <Skeleton />,
  },
  {
    title: "The Art of Design",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <Skeleton />,
  },
  {
    title: "The Power of Communication",
    description:
      "Understand the impact of effective communication in our lives.",
    header: <Skeleton />,
  },
  {
    title: "The Pursuit of Knowledge",
    description: "Join the quest for understanding and enlightenment.",
    header: <Skeleton />,
  },
  {
    title: "The Joy of Creation",
    description: "Experience the thrill of bringing ideas to life.",
    header: <Skeleton />,
  },
  {
    title: "The Spirit of Adventure",
    description: "Embark on exciting journeys and thrilling discoveries.",
    header: <Skeleton />,
  },
];
