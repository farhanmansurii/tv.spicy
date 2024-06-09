import RowLoader from "@/components/loading/RowLoader";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 lg:px-0">
      <div className="flex md:hidden h-[70vh] relative">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="relative h-[70vh] md:flex hidden mx-auto ">
        <Skeleton className="absolute inset-0" />
      </div>
      <RowLoader withHeader />
      <RowLoader withHeader />
      <RowLoader withHeader />
      <RowLoader withHeader />
    </div>
  );
}
