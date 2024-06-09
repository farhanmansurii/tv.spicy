import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Banner } from "../container/tv-details.tsx/Banner";
import { Poster } from "../container/tv-details.tsx/Poster";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

export default function DetailLoader() {
  return (
    <div className="mx-auto max-w-6xl pt-0">
      <div className="hidden md:flex">
        <Skeleton className="h-[20dvh] w-full overflow-hidden border bg-muted shadow md:rounded-lg lg:h-[30dvh]" />
      </div>
      <div className="mx-auto mb-8 max-w-4xl space-y-8 px-4 md:space-y-12 md:px-0">
        <main className="flex flex-col gap-4 md:flex-row">
          <aside className="w-10/12 mx-auto space-y-2 md:-mt-32 md:w-1/3">
            <Poster url={""} alt={""} />
          </aside>

          <article className="flex w-full mt-4 flex-col gap-2 md:w-2/3">
            <span className="text-xs animate-pulse rounded-md w-32 bg-secondary/70 text-transparent">
              {"     ."}
            </span>
            <h1 className="text-4xl font-bold animate-pulse rounded-md w-44 bg-secondary/70 text-transparent">
              FallOut
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, index: number) => {
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className="animate-pulse rounded-md w-22 bg-secondary/70 text-transparent"
                  >
                    Hi
                  </Badge>
                );
              })}

              <Separator orientation="vertical" className="h-6" />

              <Badge className="w-10 h-full text-transparent"> Hi</Badge>
            </div>
            <span className="text-xs animate-pulse rounded-md w-full bg-secondary/70 text-transparent">
              {"     ."}
            </span>{" "}
            <span className="text-xs animate-pulse rounded-md w-full bg-secondary/70 text-transparent">
              {"     ."}
            </span>{" "}
            <span className="text-xs animate-pulse rounded-md w-full bg-secondary/70 text-transparent">
              {"     ."}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button className="w-24"></Button>
              <Button variant={"secondary"} className="w-12"></Button>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
