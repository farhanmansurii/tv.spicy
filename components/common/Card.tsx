/* eslint-disable @next/next/no-img-element */
import { Show } from "@/lib/types";
import Link from "next/link";
import React from "react";
import { Motiondiv } from "./MotionDiv";
import { TextGlitch } from "../animated-common/TextFlip";
import { Skeleton } from "../ui/skeleton";
import { tmdbImage } from "@/lib/tmdb-image";
import { ImageIcon, Play } from "lucide-react";
import { TooltipContent, TooltipProvider } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import BlurFade from "../ui/blur-fade";

export default function ShowCard(props: {
    index: number;
    variants?: any;
    show: Show;
    showRank?: Boolean;
    isVertical?: Boolean;
    type?: string;
    onClick?: any;
}) {
    const { index, show, showRank, isVertical, type } = props;

    const variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
        },
    };
    function calculateDelay(index: number) {
        const staggeredIndex = index % 20 !== 0 ? index % 20 : 0;
        return staggeredIndex;
    }
    return (
        <Link
            onClick={() => props.onClick && props.onClick(show)}
            href={`/${show.media_type || type}/${show.id}`}
        >
            <Motiondiv
                initial="hidden"
                animate="visible"
                transition={{
                    delay: calculateDelay(index) * 0.1,
                    ease: "easeInOut",
                    duration: 0.5,
                }}
                viewport={{ amount: 0 }}
                custom={props.index}
                variants={variants}
                className="group group-hover:scale-95 duration-100"
            >
                {!isVertical ? (
                    <Card movie={show} index={index} type={type} />
                ) : (
                    <Card movie={show} index={index} type={type} />
                )}
            </Motiondiv>
        </Link>
    );
}
export const Card = ({ movie, language = "en-US", type, index }: any) => {
    const {
        title,
        backdrop_path: backdrop,
        overview,
        first_air_date,
        media_type,
        id,
        release_date,
        vote_average: voteAverage,
        vote_count: voteCount,
        name,
    } = movie;

    return (
        <div
            className="w-full h-full group group-hover:scale-95 duration-100 cursor-pointer space-y-2"
            data-testid="movie-card"
        >
            <div
                style={{ aspectRatio: 16 / 9 }}
                className="relative h-full  flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow"
            >
                {backdrop ? (
                    <div className="  ">
                        <BlurFade key={tmdbImage(backdrop, "w500")} delay={0.25 + index * 0.1} inView>
                            <img
                                className="object-cover    inset-0"
                                src={tmdbImage(backdrop, "w500")}
                                alt={title}
                            />
                        </BlurFade>
                        <svg
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            height="2em"
                            width="2em"
                            className="absolute z-40 group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
                        >
                            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
                        </svg>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-background">
                        <ImageIcon className="text-muted" />
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex text-sm md:text-base items-start justify-between gap-1">
                    <TextGlitch>{title || name}</TextGlitch>
                    <Badge variant="secondary">
                        {voteAverage ? voteAverage.toFixed(1) : "?"}
                    </Badge>
                </div>
                <div className={`text-xs text-muted-foreground flex gap-1 capitalize `}>
                    {(first_air_date || release_date)?.split("-")[0]}{" "}
                    <p
                        className={`${(media_type || type)?.toLowerCase() === "tv"
                                ? "uppercase"
                                : "capitalize"
                            }`}
                    >
                        • {type ? type : media_type}
                    </p>
                </div>
            </div>
        </div>
    );
};
