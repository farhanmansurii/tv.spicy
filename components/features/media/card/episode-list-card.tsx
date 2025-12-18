/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Play, ImageOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';

export const EpisodeListRow = ({ episode, active, toggle }: any) => {
  if (!episode) return null;

  // Logic for unreleased or missing data
  const isReleased = episode.air_date ? new Date(episode.air_date) <= new Date() : true;
  const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w500') : null;

  return (
    <div
      onClick={(e) => isReleased && toggle(episode, e)}
      className={cn(
        'group relative flex items-center gap-5 p-3 transition-all duration-300 rounded-2xl border select-none',
        active
          ? 'bg-white/10 border-white/20 shadow-lg'
          : 'border-transparent hover:bg-white/[0.04]',
        !isReleased && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="relative flex-shrink-0 w-36 md:w-48 aspect-video rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a]">
        {stillUrl ? (
          <img
            src={stillUrl}
            alt={episode.name}
            className={cn(
                "h-full w-full object-cover transition-transform duration-700",
                active ? "scale-110" : "group-hover:scale-110"
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
            <ImageOff className="w-6 h-6" />
          </div>
        )}

        {/* Play Icon Overlay for Active State */}
        {active && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-full p-2.5 shadow-xl">
              <Play className="w-4 h-4 fill-black text-black" />
            </div>
          </div>
        )}

        {!isReleased && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white/60" />
            </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-1.5">
          <span className={cn(
            "text-[10px] font-black tracking-[0.2em] uppercase",
            active ? "text-white" : "text-white/40"
          )}>
            EP {episode.episode_number}
          </span>
          {episode.runtime && (
            <span className="text-[10px] font-bold text-white/20 tabular-nums">
                {episode.runtime} MIN
            </span>
          )}
          {!isReleased && (
             <span className="text-[9px] font-black bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase">
                Unreleased
             </span>
          )}
        </div>

        <h4 className={cn(
          "text-base md:text-lg font-bold truncate leading-tight transition-colors",
          active ? "text-white" : "text-white/80"
        )}>
          {episode.name || `Episode ${episode.episode_number}`}
        </h4>

        <p className={cn(
            "text-xs md:text-sm line-clamp-1 mt-1 font-medium transition-colors",
            active ? "text-white/60" : "text-white/30"
        )}>
          {episode.overview || "Description for this episode is currently unavailable."}
        </p>
      </div>

      {/* Action Area (Right Side) */}
      <div className="flex-shrink-0 ml-4">
        {active ? (
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.15)] animate-in fade-in zoom-in-95 duration-500">
            <Play className="w-3 h-3 fill-black text-black" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-black">
              Now Playing
            </span>
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-4">
             <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-white">
                <Play className="w-3 h-3 fill-current ml-0.5" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
