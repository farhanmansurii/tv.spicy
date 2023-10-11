import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { fetchRowData } from "@/lib/utils";
import Link from "next/link";
import ThemeButton from "./ThemeButton";
import SearchBar from "../SearchBar";
import dynamic from "next/dynamic";
const CarousalComponent =  dynamic(
  () => import("./CarousalComponent"),
  {
    loading: () => (
      <div className="flex w-full">
       Loading
      </div>
    ),
  }
);
export const Carousal = async () => {
  const tvwatchlist = await fetchRowData("discover");
  return <CarousalComponent items={tvwatchlist} />;
};
