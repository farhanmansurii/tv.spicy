import React from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

export default function GridLoader() {
  return (
    <div className="grid grid-cols-2 w-[99%] mx-auto  gap-x-2 gap-y-10 md:grid-cols-3  md:gap-y-10   ">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className={cn(`group  w-full space-y-2  `)} key={index}>
          <Skeleton className="aspect-video" key={index} />
          <Skeleton className="h-4 w-32 " />
          <div className="flex flex-row gap-1">
            <Skeleton className="h-3 w-12 " />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
