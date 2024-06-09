import SeasonsTabLoader from "@/components/container/SeasonsTabLoader";
import DetailLoader from "@/components/loading/DetailLoader";
import RowLoader from "@/components/loading/RowLoader";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="max-w-6xl w-full space-y-10  mx-auto">
      <DetailLoader />
      <Separator className="max-w-4xl mx-auto" />
      <SeasonsTabLoader />
      <Separator className="max-w-4xl mx-auto" />
      <Skeleton className="h-[90vh] max-w-4xl mx-auto "></Skeleton>
    </div>
  );
}
