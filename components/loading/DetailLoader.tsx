import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

export default function DetailLoader() {
  return (
    <>
      <div className="lg:mx-auto">
        <div className="pb-4 lg:w-100">
          <div className="flex flex-col w-full mx-auto gap-4">
            <div className="relative w-full h-full z-30">
              {/* Replace the background placeholder with a Skeleton */}
              <Skeleton className="z-0 w-full bg-background aspect-video h-full md:h-[350px]" />
            </div>
            <div className="w-[90%] flex flex-col mx-auto">
              <div className="flex flex-row p-2 gap-4">
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="text-4xl h-[3.2rem]  font-bold lg:text-5xl w-64 " />
                    <Button size="xs" className="mt-1 h-6 bg-secondary w-10" />
                  </div>
                  <div className="flex flex-wrap h-6 gap-2">
                    <Skeleton className="w-8 " />
                    <Skeleton className="w-32" />
                    <Skeleton className="w-24 " />
                  </div>

                  <Skeleton className="text-sm h-5 w-52" />
                  <Button className="flex gap-2 lg:w-[300px] w-full">
                   
                  </Button>
                  <Skeleton className="text-sm h-16 " />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
