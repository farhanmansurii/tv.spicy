/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEpisodeDetails } from '@/lib/tmdb-fetch-helper';
import { Star, CheckCircle2, ListPlus, Play } from 'lucide-react';
import { tmdbImage } from '@/lib/tmdb-image';
import CommonTitle from '@/components/shared/animated/common-title';

interface ActiveEpisodeDetailsProps {
	showId: string | number;
	seasonNumber: number;
	episodeNumber: number;
	onPlayNext: () => void;
}

export const ActiveEpisodeDetails = ({
	showId,
	seasonNumber,
	episodeNumber,
	onPlayNext,
}: ActiveEpisodeDetailsProps) => {
  const showIdString = String(showId);
  const { data: episode, isLoading } = useQuery({
    queryKey: ['episode', showIdString, seasonNumber, episodeNumber],
    queryFn: () => fetchEpisodeDetails(showIdString, seasonNumber, episodeNumber),
    enabled: !!showId,
  });

  if (isLoading || !episode) return <div className="h-[260px] w-full bg-[#121212]/50 animate-pulse rounded-hero md:rounded-hero-md" />;

  const stillUrl = tmdbImage(episode.still_path, 'w1280');

  return (
    <div className="relative w-full overflow-hidden rounded-hero md:rounded-hero-md border border-white/10 shadow-2xl mb-12 group">
      {/* LAYER 1: Ambient Glass Bleed */}
      <div
        className="absolute inset-0 z-0 scale-150 blur-[120px] opacity-30 saturate-200 pointer-events-none"
        style={{ backgroundImage: `url(${stillUrl})`, backgroundSize: 'cover' }}
      />
      {/* LAYER 2: Frosted Overlay */}
      <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-3xl" />

      {/* LAYER 3: 15/85 Split Content */}
      <div className="relative z-20 flex flex-row items-center h-[280px] w-full p-4">
        {/* IMAGE SLAB (15% Width) */}
        <div className="w-[22%] lg:w-[15%] h-full shrink-0 overflow-hidden rounded-episode md:rounded-episode-md shadow-2xl ring-1 ring-white/10 transition-transform duration-700 group-hover:scale-[1.02]">
          <img src={stillUrl} className="h-full w-full object-cover" alt={episode.name} />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white fill-current" />
          </div>
        </div>

        {/* CONTENT SECTION (85% Width) */}
        <div className="flex-1 pl-10 pr-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_12px_red] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Up Next</span>
            <span className="ml-3 text-[10px] font-bold text-zinc-600 tracking-widest uppercase">S{seasonNumber} • E{episodeNumber}</span>
          </div>

          <CommonTitle
            text={episode.name}
            variant="large"
            as="h2"
            className="text-white mb-3 leading-tight"
          />

          <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 mb-6">
            <div className="flex items-center gap-1 text-yellow-500/90"><Star className="h-4 w-4 fill-current" /> {episode.vote_average.toFixed(1)}</div>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>{episode.air_date?.split('-')[0]}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>{episode.runtime}m</span>
          </div>

          <p className="text-zinc-400 text-base leading-relaxed line-clamp-2 mb-8 max-w-4xl italic opacity-80">{episode.overview}</p>

          <div className="flex items-center gap-3">
            <button onClick={onPlayNext} className="bg-white text-black px-10 py-3.5 rounded-card md:rounded-card-md text-[13px] font-black flex items-center gap-3 hover:bg-zinc-200 transition-all shadow-xl active:scale-95">
              <Play className="h-4 w-4 fill-current" /> PLAY NEXT
            </button>
            <button className="p-3.5 rounded-card md:rounded-card-md bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all"><CheckCircle2 className="h-5 w-5" /></button>
            <button className="p-3.5 rounded-card md:rounded-card-md bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all"><ListPlus className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
