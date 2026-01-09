/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { Show } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star } from 'lucide-react';
import BlurFade from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';

export default function MediaCard({ index, show, isVertical, type, onClick }: any) {
  const isMobile = useMediaQuery();
  const mediaType = show.media_type || type;
  const effectiveIsVertical = isVertical ?? isMobile;

  if (!mediaType) return <div className="bg-zinc-900 animate-pulse rounded-xl aspect-video" />;

  const imagePath = effectiveIsVertical ? show.poster_path : show.backdrop_path;
  const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;

  return (
    <Link
      href={`/${mediaType}/${show.id}`}
      onClick={() => onClick?.(show)}
      className="group block w-full outline-none select-none"
    >
      <div className="flex flex-col gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-zinc-900 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            "rounded-lg md:rounded-xl group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
            effectiveIsVertical ? 'aspect-[2/3]' : 'aspect-video'
          )}
        >
          {imageUrl ? (
            <BlurFade key={imageUrl} delay={0.015 * (index % 12)} inView duration={0.3} yOffset={4} className="h-full w-full">
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading={index < 8 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-lg md:rounded-xl pointer-events-none" />
            </BlurFade>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-[10px] font-bold text-zinc-800 uppercase tracking-widest">No Image</div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 px-1">
          <h3 className="text-[14px] font-semibold text-zinc-300 truncate group-hover:text-white transition-colors duration-300">{show.title || show.name}</h3>
          <div className="flex items-center gap-2 text-[12px] text-zinc-500 font-medium tabular-nums">
            <span>{(show.first_air_date || show.release_date)?.split('-')[0]}</span>
            {show.vote_average > 0 && (
              <>
                <span className="opacity-20">•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-zinc-600 text-zinc-600 group-hover:fill-yellow-600 group-hover:text-yellow-600 transition-colors" />
                  <span className="group-hover:text-zinc-400 transition-colors">{show.vote_average.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
