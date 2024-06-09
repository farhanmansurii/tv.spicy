import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Banner } from "../container/tv-details.tsx/Banner";
import { Poster } from "../container/tv-details.tsx/Poster";

export default function DetailLoader() {
  return (
    // <>
    //   <div className={cn("mx-auto max-w-6xl md:pt-4")}>
    //     <div className="hidden md:flex">
    //       <Skeleton className="h-[20dvh] w-full overflow-hidden border bg-muted shadow md:rounded-lg lg:h-[30dvh]" />
    //     </div>
    //   </div>
    //   <main className="flex flex-col gap-4 md:flex-row">
    //     <aside className="w-10/12 mx-auto space-y-2 md:-mt-32 md:w-1/3">
    //       <div
    //         className={cn(
    //           "relative flex aspect-poster mx-auto   w-full items-center justify-center overflow-hidden rounded-lg border text-muted shadow"
    //         )}
    //       >
    //         <Skeleton className="" />
    //       </div>
    //     </aside>
    //   </main>
    //   <div className="mx-auto mb-8 max-w-4xl space-y-8 px-4 md:space-y-12 md:px-0"></div>
    //   <div className="flex md:hidden h-[70vh] relative">
    //     <Skeleton className="absolute inset-0" />
    //   </div>
    //   <div className="relative h-[70vh] md:flex hidden mx-auto ">
    //     <Skeleton className="absolute inset-0" />
    //   </div>
    // </>
    <div className="mx-auto max-w-6xl md:pt-4">
      <Skeleton className="h-64 w-full" />

      <main className="flex flex-col gap-4 md:flex-row">
        <aside className="w-10/12 mx-auto space-y-2 md:-mt-32 md:w-1/3">
          <div
            className={cn(
              "relative flex aspect-poster mx-auto   w-full items-center justify-center overflow-hidden rounded-lg border text-muted shadow"
            )}
          >
            <Skeleton className="" />
          </div>
        </aside>

        <div className="space-y-2 w-2/3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      </main>
    </div>
  );
}
