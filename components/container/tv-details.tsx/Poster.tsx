/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { Image as LucideImage } from "lucide-react";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { tmdbImage } from "@/lib/tmdb-image";
import BlurFade from "@/components/ui/blur-fade";

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
            style={{ aspectRatio: '2/2.8', }}
            {...props}
        >
            {url ? (
                <BlurFade key={url} delay={0.25 + 1 * 0.05} inView>
                    <img
                        style={{
                            objectPosition:'center',
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                            transform:'translateY(6px)'
                        }}
                        alt={alt}
                        src={url}
                    /> </BlurFade>
            ) : (
                <LucideImage className="z-20" size={24} />
            )}
        </div>
    );
};
