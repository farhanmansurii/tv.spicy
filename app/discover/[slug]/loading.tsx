import GridLoader from "@/components/loading/GridLoader";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl md:pt-4 space-y-8">
      <div className="flex   mb-4   justify-between  mx-auto text-xl md:text-2xl items-center  py-1 flex-row">
        <div className=" flex text-3xl font-bold capitalize px-2  md:text-4xl gap-2 items-center">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
      </div>
      <div className="mb-[4rem] flex  gap-[3rem] flex-col mx-auto">
        <GridLoader />
      </div>
    </div>
  );
}
