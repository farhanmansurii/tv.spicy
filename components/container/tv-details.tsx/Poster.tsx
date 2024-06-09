/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { Image as LucideImage } from "lucide-react";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { tmdbImage } from "@/lib/tmdb-image";

type PosterProps = {
  url?: string;
  alt: string;
} & ComponentProps<"div">;

export const Poster = ({ url, alt, className, ...props }: PosterProps) => {
  return (
    <div
      className={cn(
        "relative flex aspect-poster mx-auto  w-full items-center justify-center overflow-hidden rounded-lg border text-muted shadow",
        className
      )}
      {...props}
    >
      {url ? (
        <img className="object-fill " alt={alt} src={tmdbImage(url)} />
      ) : (
        <LucideImage size={24} />
      )}
    </div>
  );
};
