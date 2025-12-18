'use client';

import React from 'react';
import { Episode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import { Play } from 'lucide-react';
import CommonTitle from '@/components/shared/animated/common-title';

interface EpisodeCardProps {
  episode: Episode;
  active: boolean;
  toggle: (episode: Episode, event: React.MouseEvent<HTMLDivElement>) => void;
  view: 'grid' | 'list' | 'carousel';
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, active, toggle, view }) => {
  if (!episode) return null;
  const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w500') : null;
  const isList = view === 'list';
  const isGrid = view === 'grid';
  const isCarousel = view === 'carousel';

  return (
    <div
      onClick={(e) => toggle(episode, e)}
      className={cn(
        'group relative flex cursor-pointer transition-all duration-300 border',
        'rounded-episode md:rounded-episode-md overflow-hidden shadow-lg',
        'hover:shadow-xl hover:scale-[1.02]',
        active
          ? 'bg-white/10 border-white/30 ring-1 ring-white/20 shadow-2xl'
          : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-800/60',
        isList
          ? 'flex-row items-center h-[90px] sm:h-[100px] md:h-[120px] p-2 sm:p-3 gap-3 sm:gap-4'
          : 'flex-col'
      )}
    >
      {/* Cinematic Background Glow */}
      {active && stillUrl && (
        <div
          className="absolute inset-0 z-0 scale-150 blur-[60px] opacity-30 saturate-200 pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url(${stillUrl})`, backgroundSize: 'cover' }}
        />
      )}

      {/* Image Container */}
      <div className={cn(
        "relative z-10 shrink-0 overflow-hidden bg-zinc-800",
        "rounded-episode-image md:rounded-episode-image-md",
        isList
          ? "h-full aspect-video w-[120px] sm:w-[140px] md:w-[180px]"
          : "w-full aspect-video"
      )}>
        {stillUrl ? (
          <img
            src={stillUrl}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={episode.name}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-zinc-900">
            <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white/20 fill-current" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white text-black p-2 sm:p-2.5 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
          </div>
        </div>

        {episode.runtime && (
          <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-ui bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] font-black text-white border border-white/10">
            {episode.runtime}M
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={cn(
        "relative z-10 flex flex-col justify-center min-w-0 flex-1",
        isList
          ? "pr-2 sm:pr-3 md:pr-4"
          : "p-3 sm:p-4 md:p-5"
      )}>
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
          <span className={cn(
            "text-[10px] sm:text-[11px] font-black uppercase",
            "tracking-extra",
            active ? "text-white" : "text-zinc-500"
          )}>
            EP {episode.episode_number}
          </span>
          {active && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          )}
        </div>

        <CommonTitle
          text={episode.name}
          variant="small"
          as="h3"
          className={cn(
            "mb-1 sm:mb-1.5 transition-colors line-clamp-1 truncate",
            active ? "text-white" : "text-zinc-200 group-hover:text-white"
          )}
        />

        <p className={cn(
          "text-xs sm:text-sm leading-relaxed line-clamp-2 font-medium",
          "opacity-60 transition-opacity group-hover:opacity-80",
          active ? "text-zinc-200" : "text-zinc-400"
        )}>
          {episode.overview || "No description available."}
        </p>
      </div>

      {/* Active Indicator Line */}
      {active && (
        <div className={cn(
          "absolute bg-white z-20 transition-all",
          isList
            ? "left-0 top-0 bottom-0 w-0.5 sm:w-1"
            : "bottom-0 left-0 right-0 h-0.5 sm:h-1"
        )} />
      )}
    </div>
  );
};
