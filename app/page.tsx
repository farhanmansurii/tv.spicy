import MinimalSocialsFooter from "@/components/common/Footer";
import RecentlyWatched from "@/components/common/RecentlyWatched";
import WatchList from "@/components/common/WatchList";
import { Header } from "@/components/common/header";
import SeasonsTabLoader from "@/components/container/SeasonsTabLoader";
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
    <div className="mx-auto max-w-6xl space-y-4 px-4 lg:px-0">
      <Carousal />
      <RowLoader withHeader={false} />
      <RecentlyWatched />
      <RowContainer />
      <MinimalSocialsFooter />
    </div>
  );
}
