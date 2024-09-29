import DetailLoader from "@/components/loading/DetailLoader";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="max-w-4xl w-full space-y-10  mx-auto">
      <DetailLoader />
      <Separator className="max-w-4xl mx-auto" />
      <div className="flex max-w-4xl w-full flex-col mx-auto gap-2">
        <Skeleton className=" h-12 mb-2 w-36"></Skeleton>
        <Skeleton className="aspect-video w-full   mx-auto " />
      </div>
      <Separator className="max-w-4xl mx-auto" />
      <Skeleton className="h-[90vh] max-w-4xl mx-auto "></Skeleton>
    </div>
  );
}
