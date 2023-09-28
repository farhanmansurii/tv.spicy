import SearchBar from "@/components/SearchBar";
import Navbar from "@/components/common/Navbar";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import HomePage from "@/components/container/HomePage";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar/>
      <RecentlyWatched/>
      <HomePage />
      
    </div>
  );
}
