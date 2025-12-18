/* eslint-disable @next/next/no-img-element */
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

  return (
    <div
      onClick={(e) => toggle(episode, e)}
      className={cn(
        'group relative flex cursor-pointer transition-all duration-500 overflow-hidden',
        'rounded-episode md:rounded-episode-md border border-white/10 shadow-2xl',
        isList
          ? 'flex-col md:flex-row items-stretch md:items-center min-h-auto md:h-[180px] p-3 md:p-4 gap-4 md:gap-0'
          : 'flex-col min-h-[350px]',
        active ? 'ring-2 ring-white/40 bg-zinc-900/40' : 'bg-transparent hover:bg-white/5'
      )}
    >
      {episode.still_path && (
        <div
          className="absolute inset-0 z-0 scale-125 blur-[100px] opacity-20 saturate-200 pointer-events-none"
          style={{ backgroundImage: `url(${stillUrl})`, backgroundSize: 'cover' }}
        />
      )}

      <div className={cn(
        "relative z-10 shrink-0 overflow-hidden bg-zinc-800 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]",
        isList
          ? "aspect-video md:aspect-auto w-full md:w-1/4 md:h-full rounded-episode-image md:rounded-episode-image-md"
          : "w-full aspect-video rounded-t-episode md:rounded-t-episode-md"
      )}>
        {stillUrl ? (
          <img src={stillUrl} className="h-full w-full object-cover" alt={episode.name} />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-zinc-900/50">
            <Play className="h-12 w-12 text-white/30 fill-current" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-8 w-8 text-white fill-current" />
        </div>

        {episode.runtime && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/80 backdrop-blur-md text-[9px] md:text-[10px] font-bold text-white border border-white/10">
            {episode.runtime}m
          </div>
        )}
      </div>

      <div className={cn(
        "relative z-10 flex flex-col justify-center",
        isList
          ? "w-full md:w-3/4 px-2 md:pl-8 md:pr-4 pb-2 md:pb-0"
          : "w-full p-6 md:p-8"
      )}>
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Episode {episode.episode_number}
          </span>
          <span className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase">
            {episode.air_date?.split('-')[0]}
          </span>
        </div>

        <CommonTitle
          text={episode.name}
          variant="small"
          as="h3"
          className="text-white mb-1 md:mb-2 group-hover:text-zinc-200 transition-colors line-clamp-1"
        />

        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed line-clamp-2 font-medium italic opacity-80">
          {episode.overview || "No description available for this episode."}
        </p>
      </div>

      {active && (
        <div className={cn(
          "absolute bg-white rounded-full shadow-[0_0_15px_white] z-20",
          isList
            ? "left-0 top-0 w-full h-1 md:left-2 md:top-1/2 md:-translate-y-1/2 md:h-16 md:w-1.5"
            : "bottom-0 left-0 w-full h-1"
        )} />
      )}
    </div>
  );
};
