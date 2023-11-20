import SearchBar from "@/components/SearchBar";
import { Carousal } from "@/components/common/Carousal";
import Navbar from "@/components/common/Navbar";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import HomePage from "@/components/container/HomePage";
import RowLoader from "@/components/loading/RowLoader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="w-11/12 my-[3rem] mx-auto flex justify-between">
        <div></div>
        <SearchBar />
      </div>
      <RecentlyWatched />
      <WatchList />
      <HomePage />
    </div>
  );
}
