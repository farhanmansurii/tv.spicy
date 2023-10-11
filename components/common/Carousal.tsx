import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { fetchRowData } from "@/lib/utils";
import Link from "next/link";
import ThemeButton from "./ThemeButton";
import SearchBar from "../SearchBar";
import CarousalComponent from "./CarousalComponent";

export const Carousal = async () => {
  const tvwatchlist = await fetchRowData("discover");
  return (
    <CarousalComponent items={tvwatchlist}/>
  );
};
