/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Play, ImageOff, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';

export const EpisodeCard = ({ episode, active, toggle }: any) => {
  if (!episode) return null;

  const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
  const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'original') : null;
  const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;

  return (
    <div
      onClick={(e) => isReleased && toggle(episode, e)}
      className={cn(
        'group relative aspect-video w-full overflow-hidden select-none transition-all duration-500 ease-out',
        'rounded-2xl border bg-black shadow-sm',
        active
          ? 'ring-[3px] ring-primary ring-offset-2 ring-offset-background scale-[0.97] shadow-xl'
          : 'border-white/5 hover:scale-[1.02] hover:shadow-2xl',
        !isReleased && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="absolute inset-0 z-0">
        {stillUrl ? (
          <img
            src={stillUrl}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-transform duration-[2000ms] ease-out",
              active ? "scale-105" : "scale-100 group-hover:scale-105"
            )}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-neutral-900">
            <ImageOff className="w-8 h-8 text-neutral-700" />
          </div>
        )}
      </div>

      <div className={cn(
        "absolute inset-0 z-10 transition-opacity duration-500 bg-gradient-to-t from-black/90 via-black/20 to-transparent",
        active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
      )} />

      <div className="absolute top-3 left-3 z-30 flex gap-2">
        {episode.runtime && (
          <div className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-medium text-white/90 uppercase tracking-tight">
            {episode.runtime} min
          </div>
        )}
      </div>

      <div className="relative z-20 h-full w-full flex flex-col justify-end p-4 md:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
              E{episode.episode_number}
            </span>
            {rating && (
              <div className="flex items-center gap-0.5 text-[10px] font-medium text-white/60">
                <Star className="w-2.5 h-2.5 fill-current text-yellow-500/80" />
                {rating}
              </div>
            )}
          </div>

          <h3 className="text-[14px] md:text-xl font-semibold text-white leading-tight tracking-tight">
            {episode.name || `Episode ${episode.episode_number}`}
          </h3>

          <div className={cn(
            "grid transition-all duration-500 ease-in-out",
            active || "group-hover:grid-rows-[1fr] grid-rows-[0fr]"
          )}>
            <p style={{lineHeight: '1.4'}} className={cn(
              "overflow-hidden text-[10px] md:text-sm text-white/60 leading-relaxed  line-clamp-2 font-normal",
              active ? "opacity-100 mt-1" : "opacity-0 group-hover:opacity-100 group-hover:mt-1"
            )}>
              {episode.overview || "No description available."}
            </p>
          </div>
        </div>

        {!active && isReleased && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white">
                    <Play className="w-5 h-5 fill-current ml-1" />
                </div>
            </div>
        )}

        {active && (
            <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
            </div>
        )}

        {!isReleased && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <Lock className="w-5 h-5 text-white/30" />
          </div>
        )}
      </div>
    </div>
  );
};
