/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Play, ImageOff, Lock, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';

export const EpisodeCard = ({ episode, active, toggle, watched }: any) => {
  if (!episode) return null;

  const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
  const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'original') : null;
  const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;
  const hasGoodRating = episode.vote_average && episode.vote_average >= 8.0;

  return (
    <div
      onClick={(e) => isReleased && toggle(episode, e)}
      className={cn(
        'group relative aspect-video w-full overflow-hidden select-none transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        'rounded-xl md:rounded-2xl border bg-card text-card-foreground',
        active
          ? 'border-primary ring-1 ring-primary/40 scale-[0.98] shadow-2xl'
          : 'border-white/10 hover:border-white/30 hover:scale-[1.02]',
        !isReleased && 'opacity-40 cursor-not-allowed'
      )}
    >
      <div className="absolute inset-0 z-0">
        {stillUrl ? (
          <img
            key={stillUrl}
            src={stillUrl}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-transform duration-1000 ease-out",
              active ? "scale-110 saturate-[1.1] opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
            )}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
            <ImageOff className="w-10 h-10 opacity-20" />
          </div>
        )}
      </div>

      <div className={cn(
        "absolute inset-0 z-10 transition-opacity duration-700",
        "bg-gradient-to-t from-black via-black/60 to-transparent",
        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />

      <div className="relative z-20 h-full w-full flex flex-col justify-end p-5 md:p-6">
        <div className={cn(
            "flex flex-col gap-1 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            active ? "translate-y-0" : "translate-y-6 group-hover:translate-y-0"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase transition-colors duration-500",
              active ? "text-primary" : "text-white/70 group-hover:text-primary"
            )}>
              Episode {episode.episode_number}
            </span>
            {episode.runtime && (
              <span className="text-[10px] font-bold text-white/40 tabular-nums">
                {episode.runtime}m
              </span>
            )}
            {rating && (
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity",
                hasGoodRating ? "text-yellow-500" : "text-white/50"
              )}>
                <Star className={cn("w-2.5 h-2.5", hasGoodRating && "fill-current")} />
                {rating}
              </div>
            )}
          </div>

          <h3 className={cn(
            "text-base md:text-xl font-bold tracking-tight leading-tight transition-colors duration-500",
            "text-white"
          )}>
            {episode.name || `Chapter ${episode.episode_number}`}
          </h3>

          <p className={cn(
            "text-[11px] md:text-[13px] line-clamp-2 leading-relaxed font-semibold mt-1.5 transition-all duration-700",
            "text-white/80",
            active
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 translate-y-4 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible"
          )}>
            {episode.overview || "No description available for this episode."}
          </p>
        </div>

        {active && (
          <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
             </div>
          </div>
        )}

        {!isReleased && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <Lock className="w-6 h-6 text-white/40" />
            </div>
        )}
      </div>
    </div>
  );
};
