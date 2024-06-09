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

type TvSerieDetailsProps = {
  id: number;
  language: any;
  embed?: boolean;
  tvSerie: any;
  type: "tv" | "movie";
};

export const TvSerieDetails = async ({
  id,
  tvSerie,
  language,
  embed = false,
  type,
}: TvSerieDetailsProps) => {
  return (
    <div className={cn("mx-auto max-w-6xl md:pt-4", embed && "pt-0")}>
      <div className="hidden md:flex">
        <Banner url={tmdbImage(tvSerie.backdrop_path)} />
      </div>
      <div className="mx-auto mb-8 max-w-4xl space-y-8 px-4 md:space-y-12 md:px-0">
        <main className="flex flex-col gap-4 md:flex-row">
          <aside className="w-full  mx-auto space-y-2 md:-mt-32 md:w-1/3">
            <Poster url={tvSerie.poster_path} alt={tvSerie.name} />
          </aside>

          <article className="flex w-full flex-col gap-2 md:w-2/3">
            {tvSerie.first_air_date && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(tvSerie.first_air_date), "PPP")}
              </span>
            )}
            {tvSerie.release_date && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(tvSerie.release_date), "PPP")}
              </span>
            )}

            <h1 className="text-4xl font-bold">
              {tvSerie.name || tvSerie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-1.5">
              {tvSerie.genres.map((genre: any) => {
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
                    <Badge>{tvSerie.vote_average.toFixed(1)}</Badge>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{tvSerie.vote_count} votes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="text-xs leading-5 line-clamp-3 text-muted-foreground md:text-sm md:leading-6">
              {tvSerie.overview}
            </p>
            <div className="flex flex-wrap gap-2">
              {/* <ContinueWatchingButton
                key={id}
                show={tvSerie}
                id={id}
                type={type}
              /> */}
              <Button>Play S1 E1</Button>
              <Button variant={"secondary"}>Add</Button>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
};
