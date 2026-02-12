'use client';

import React from 'react';
import CommonTitle from '@/components/shared/animated/common-title';

interface SeasonInfoProps {
  seasonData: any;
}
export const SeasonInfo = ({ seasonData }: SeasonInfoProps) => {
  if (!seasonData) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-hero md:rounded-hero-md border border-white/5 shadow-2xl mb-12 bg-black/75 backdrop-blur-3xl">
      <div className="relative z-20 flex flex-col items-center w-full p-4 md:p-6 md:h-auto gap-6">
        <div className="w-full px-4 md:px-10 md:py-6 flex flex-col justify-center text-left">
          <div className="flex items-start justify-start gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
            <span className="text-xs font-medium text-zinc-400">Season Overview</span>
          </div>
          <CommonTitle
            text={seasonData.name}
            variant="large"
            as="h2"
            className="text-white mb-3"
          />
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 text-xs md:text-sm font-medium text-zinc-400">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{new Date(seasonData.air_date).getFullYear()}</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{seasonData.episodes?.length} Episodes</span>
          </div>

          <p className="max-w-5xl text-zinc-400 text-sm md:text-base leading-relaxed line-clamp-3 opacity-80">{seasonData.overview}</p>
        </div>
      </div>
    </div>
  );
};
