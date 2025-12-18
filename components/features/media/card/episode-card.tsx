/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Play, ImageOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';

export const EpisodeCard = ({ episode, active, toggle }: any) => {
  if (!episode) return null;

  // Logic for unreleased or missing data
  const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
  const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'original') : null;

  return (
    <div
      onClick={(e) => isReleased && toggle(episode, e)}
      className={cn(
        'group relative cursor-pointer overflow-hidden transition-all duration-500 ease-out',
        'rounded-[24px] border bg-[#1a1a1a] shadow-2xl',
        'aspect-[1.62/1] w-full select-none',
        active
          ? 'border-white/40 ring-1 ring-white/20 scale-[0.98] z-10 shadow-white/5'
          : 'border-white/[0.08] hover:border-white/20',
        !isReleased && 'opacity-50 cursor-not-allowed'
      )}
    >
      {stillUrl ? (
        <img
          src={stillUrl}
          className={cn(
            "absolute inset-0 z-0 h-full w-full object-cover transition-all duration-1000",
            active ? "scale-105 saturate-[1.1]" : "group-hover:scale-105 opacity-80"
          )}
          alt={episode.name}
        />
      ) : (
        <div className="absolute inset-0 z-0 h-full w-full flex flex-col items-center justify-center gap-3 text-white/20 bg-[#1a1a1a]">
          <ImageOff className="w-12 h-12 md:w-16 md:h-16" />
        </div>
      )}
      <div
        className={cn(
            "absolute inset-0 z-10 transition-opacity duration-500",
            active ? "backdrop-blur-none opacity-0" : "backdrop-blur-[5px] opacity-100"
        )}
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 85%, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 85%, black 100%)',
        }}
      />

      <div className={cn(
        "absolute inset-0 z-20 transition-opacity duration-500",
        active
            ? "bg-gradient-to-t from-black/95 via-black/40 to-transparent"
            : "bg-gradient-to-t from-black/95 via-black/40 to-transparent"
      )} />

      <div className="relative z-30 h-full w-full flex flex-col justify-end px-5 md:px-6 pb-5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "text-[10px] md:text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-300",
              active ? "text-white" : "text-white/50"
            )}>
              Episode {episode.episode_number}
            </span>
            {!isReleased && (
              <span className="text-[9px] font-black bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase">
                Unreleased
              </span>
            )}
          </div>

          <h3 className={cn(
            "text-lg md:text-[23px] font-bold tracking-tight leading-tight transition-colors duration-300",
            active ? "text-white" : "text-white/90"
          )}>
            {episode.name}
          </h3>

          <p className={cn(
            "text-[12.5px] md:text-[14.5px] line-clamp-2 leading-[1.5] font-medium max-w-[98%] mt-1 transition-colors duration-300",
            active ? "text-white/90" : "text-white/60"
          )}>
            {episode.overview || "No description available for this episode."}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className={cn(
            "flex items-center gap-2.5 transition-colors duration-300",
            active ? "text-white" : "text-white/80"
          )}>
            <span className="text-[14px] font-bold tabular-nums tracking-tight">
              {episode.runtime ? `${episode.runtime}m` : '56m'}
            </span>
          </div>

          {active && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-right-4 duration-500">
              <Play className="w-3 h-3 fill-black text-black" />
              <span className="text-[10px] font-black uppercase tracking-wider text-black">
                Now Playing
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
