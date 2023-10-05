import SearchBar from "@/components/SearchBar";
import Navbar from "@/components/common/Navbar";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import HomePage from "@/components/container/HomePage";
import RowLoader from "@/components/loading/RowLoader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <RecentlyWatched />
      <HomePage />
    </div>
  );
}
