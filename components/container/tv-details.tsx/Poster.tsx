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
        "relative flex aspect-poster mx-auto bg-muted  w-full items-center justify-center overflow-hidden rounded-lg border text-muted shadow",
        className
      )}
      {...props}
    >
      {url ? (
        <img
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
          alt={alt}
          src={url}
        />
      ) : (
        <LucideImage className="z-20" size={24} />
      )}
    </div>
  );
};
