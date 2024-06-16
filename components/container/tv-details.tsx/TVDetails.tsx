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
import { easeInOut, motion } from "framer-motion";
import NextBreadcrumb from "@/components/breadcrumbs";

type showDetailsProps = {
  id: number;
  language: any;
  embed?: boolean;
  show: any;
  type: "tv" | "movie";
};

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      easeInOut: "easeInOut",
    },
  }),
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
            <Poster url={tmdbImage(show.poster_path)} alt={show.name} />
          </aside>

          <motion.article
            initial="hidden"
            animate="visible"
            className="flex w-full mt-4 flex-col gap-2 md:w-2/3"
          >
            {show?.first_air_date && (
              <motion.span
                variants={fadeUp}
                custom={0}
                className="text-xs text-muted-foreground"
              >
                {format(new Date(show.first_air_date), "PPP")}
              </motion.span>
            )}
            {show?.release_date && (
              <motion.span
                variants={fadeUp}
                custom={1}
                className="text-xs text-muted-foreground"
              >
                {format(new Date(show.release_date), "PPP")}
              </motion.span>
            )}

            <motion.h1
              variants={fadeUp}
              custom={2}
              className="text-4xl font-bold"
            >
              {show.name || show.title}
            </motion.h1>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap items-center gap-1.5"
            >
              {show.genres.map((genre: any, index: any) => (
                <motion.div key={genre.id} variants={fadeUp}>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {genre.name}
                  </Badge>
                </motion.div>
              ))}

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
            </motion.div>

            <motion.p
              variants={fadeUp}
              custom={show.genres.length + 4}
              className="text-xs leading-5 line-clamp-3 text-muted-foreground md:text-sm md:leading-6"
            >
              {show.overview}
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={show.genres.length + 5}
              className="flex flex-wrap gap-2"
            >
              <ContinueWatchingButton
                isDetailsPage={true}
                id={show.id}
                type={type}
                show={show}
              />
            </motion.div>
          </motion.article>
        </main>
      </div>
    </div>
  );
}
