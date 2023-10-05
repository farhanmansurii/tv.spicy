import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export default function RowLoader() {
  return (
    <div className=" flex gap-0 flex-col mx-auto mb-5">
      <div className="flex items-center justify-between">
        <Skeleton className="text-2xl lg:text-3xl mx-2 h-10 w-32" />
        <div className="flex gap-3 items-center">
          <Button
            size="icon"
            className="bg-secondary text-primary rounded-full w-6 h-6 p-1"
            disabled // Disable navigation while loading
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            className="bg-secondary text-primary rounded-full w-6 h-6 p-1"
            disabled // Disable navigation while loading
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div
        className="w-full flex flex-row whitespace-nowrap overflow-hidden"
        style={{
          overflowX: "scroll",
          scrollbarWidth: "none", // Hide the scrollbar in Firefox
          WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
        }}
      >
        <div className="flex gap-[2px]">
          <Skeleton className=" my-3 rounded-none h-58 md:h-72 w-32 md:w-48" />
          <Skeleton className=" my-3 rounded-none h-58 md:h-72 w-32 md:w-48" />
          <Skeleton className=" my-3 rounded-none h-58 md:h-72 w-32 md:w-48" />
          <Skeleton className=" my-3 rounded-none h-58 md:h-72 w-32 md:w-48" />
          <Skeleton className=" my-3 rounded-none h-58 md:h-72 w-32 md:w-48" />
          <Skeleton className=" my-3 rounded-none h-58 md:h-72 w-32 md:w-48" />
        </div>
      </div>
    </div>
  );
}
