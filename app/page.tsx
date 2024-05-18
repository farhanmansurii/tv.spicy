import IconTabs from "@/components/common/DockMenu";
import MinimalSocialsFooter from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import RowLoader from "@/components/loading/RowLoader";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
const RowContainer = dynamic(
  () => import("@/components/container/RowContainer"),
  {
    ssr: true,
  }
);
const Carousal = dynamic(() => import("../components/common/Carousal"), {
  ssr: false,
  loading: () => (
    <>
      <div className="flex md:hidden h-[70vh] relative">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="relative h-[70vh] md:flex hidden mx-auto ">
        <Skeleton className="absolute inset-0" />
      </div>
    </>
  ),
});

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className=" mx-auto flex justify-between"></div>
      <Carousal />
      <RecentlyWatched />
      <RowContainer />
      <MinimalSocialsFooter />
    </div>
  );
}
