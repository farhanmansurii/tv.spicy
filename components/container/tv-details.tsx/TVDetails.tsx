"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { tmdbImage } from "@/lib/tmdb-image";
import { Banner } from "./Banner";
import { Poster } from "./Poster";
import { Button } from "@/components/ui/button";
import ContinueWatchingButton from "@/components/common/ContinueWatchingButton";
import Navbar from "@/components/common/Navbar";
import { Header } from "@/components/common/header";

type showDetailsProps = {
  id: number;
  language: any;
  embed?: boolean;
  show: any;
  type: "tv" | "movie";
};

export default function ShowDetails({
  id,
  show,
  language,
  embed = false,
  type,
}: showDetailsProps) {
  return (
    <div className={cn("mx-auto w-full  md:pt-0")}>
      <div className="hidden md:flex">
        <Banner url={tmdbImage(show.backdrop_path)} />
      </div>
      <div className="mx-auto mb-8 max-w-4xl space-y-8 px-4 md:space-y-12 md:px-0">
        <main className="flex flex-col gap-4 md:flex-row">
          <aside className="w-10/12 mx-auto space-y-2 md:-mt-32 md:w-1/3">
            <Poster url={show.poster_path} alt={show.name} />
          </aside>

          <article className="flex w-full mt-4 flex-col gap-2 md:w-2/3">
            {show?.first_air_date && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(show.first_air_date), "PPP")}
              </span>
            )}
            {show?.release_date && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(show.release_date), "PPP")}
              </span>
            )}

            <h1 className="text-4xl font-bold">{show.name || show.title}</h1>

            <div className="flex flex-wrap items-center gap-1.5">
              {show.genres.map((genre: any) => {
                return (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {genre.name}
                  </Badge>
                );
              })}

              <Separator orientation="vertical" className="h-6" />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge>{show.vote_average.toFixed(1)}</Badge>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{show.vote_count} votes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="text-xs leading-5 line-clamp-3 text-muted-foreground md:text-sm md:leading-6">
              {show.overview}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button>Play S1 E1</Button>
              <Button variant={"secondary"}>Add</Button>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}
