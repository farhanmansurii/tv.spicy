/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Play, ImageOff, Lock, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';

export const EpisodeListRow = ({ episode, active, toggle, watched }: any) => {
  if (!episode) return null;

  const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
  const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w500') : null;
  const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;
  const hasGoodRating = episode.vote_average && episode.vote_average >= 8.0;

  return (
    <div
      onClick={(e) => isReleased && toggle(episode, e)}
      className={cn(
        'group relative flex items-center gap-4 md:gap-6 p-2 md:p-2.5 transition-all duration-500 rounded-xl select-none',
        active
          ? 'bg-primary/10 border border-primary/30 shadow-lg shadow-primary/10'
          : 'hover:bg-white/[0.03] cursor-pointer border border-transparent',
        !isReleased && 'opacity-40 cursor-not-allowed'
      )}
    >
      {/* 1. THUMBNAIL: Disciplined Aspect Ratio */}
      <div className="relative flex-shrink-0 w-32 md:w-44 aspect-video rounded-lg overflow-hidden bg-zinc-900 ring-1 ring-inset ring-white/5">
        {stillUrl ? (
          <img
            src={stillUrl}
            alt=""
            className={cn(
                "h-full w-full object-cover transition-transform duration-1000 ease-out",
                active ? "scale-105" : "group-hover:scale-110"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-800">
            <ImageOff className="w-5 h-5" />
          </div>
        )}

        {/* Dynamic Overlay based on state */}
        {active ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in duration-500">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xl scale-90 md:scale-100">
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </div>
          </div>
        ) : isReleased && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            </div>
          </div>
        )}

        {!isReleased && (
            <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white/40" />
            </div>
        )}
      </div>

      {/* 2. INFO SECTION: High-Density Typography */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold tracking-widest uppercase",
            active ? "text-primary" : "text-zinc-500"
          )}>
            EP {episode.episode_number}
          </span>
          {episode.runtime && (
            <span className="text-[10px] font-medium text-zinc-600 tabular-nums">
                {episode.runtime} MIN
            </span>
          )}
          {rating && (
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold tabular-nums opacity-70",
              hasGoodRating ? "text-yellow-500" : "text-white/50"
            )}>
              <Star className={cn("w-2.5 h-2.5", hasGoodRating && "fill-current")} />
              {rating}
            </div>
          )}
        </div>

        <h4 className={cn(
          "text-sm md:text-base font-semibold truncate transition-colors",
          active ? "text-white font-bold" : "text-zinc-200 group-hover:text-white"
        )}>
          {episode.name || `Episode ${episode.episode_number}`}
        </h4>

        <p className={cn(
            "text-[12px] md:text-xs line-clamp-1 md:line-clamp-2 mt-0.5 font-medium leading-relaxed transition-colors",
            active ? "text-zinc-400" : "text-zinc-500 group-hover:text-zinc-400"
        )}>
          {episode.overview || "No description available for this episode."}
        </p>
      </div>

      {/* 3. STATUS INDICATOR: Minimalist */}
      <div className="flex-shrink-0 ml-2 md:ml-4">
        {active && (
          <div className="flex items-center gap-2 py-1 px-3 rounded-full bg-white/5 border border-white/10">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider text-white">Playing</span>
          </div>
        )}
      </div>
    </div>
  );
};
