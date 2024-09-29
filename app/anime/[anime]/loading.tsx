import SeasonsTabLoader from "@/components/container/SeasonsTabLoader";
import DetailLoader from "@/components/loading/DetailLoader";
import RowLoader from "@/components/loading/RowLoader";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="max-w-4xl w-full space-y-10  mx-auto">
      <DetailLoader />
      <Separator className="max-w-4xl px-4 lg:px-0 mx-auto" />
      <div className="mx-auto max-w-4xl w-full px-4 md:px-0 -full">
        <SeasonsTabLoader />
      </div>
      <Separator className="max-w-4xl mx-auto" />
      <Skeleton className="h-[90vh] max-w-4xl mx-auto "></Skeleton>
    </div>
  );
}
