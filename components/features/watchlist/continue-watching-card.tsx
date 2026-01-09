'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Episode } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';
import BlurFade from '@/components/ui/blur-fade';

interface ContinueWatchingCardProps {
    episode: Episode;
    index: number;
}

export function ContinueWatchingCard({ episode, index }: ContinueWatchingCardProps) {
    const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w500') : null;
    const showId = episode.tv_id;
    const episodeUrl = `/tv/${showId}?season=${episode.season_number}&episode=${episode.episode_number}`;

    return (
        <Link
            href={episodeUrl}
            className="group block w-full outline-none select-none"
        >
            <div className="flex flex-col gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                <div
                    className={cn(
                        "relative w-full overflow-hidden bg-zinc-900 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                        "rounded-lg md:rounded-xl group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
                        "aspect-video"
                    )}
                >
                    {stillUrl ? (
                        <BlurFade key={stillUrl} delay={0.015 * (index % 12)} inView duration={0.3} yOffset={4} className="h-full w-full">
                            <img
                                src={stillUrl}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                loading={index < 8 ? "eager" : "lazy"}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-lg md:rounded-xl pointer-events-none" />

                            {/* Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 fill-black text-black ml-1" />
                                </div>
                            </div>

                            {/* Episode Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
                                <div className="flex items-center gap-2 text-white">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                        S{episode.season_number} E{episode.episode_number}
                                    </span>
                                </div>
                            </div>
                        </BlurFade>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-[10px] font-bold text-zinc-800 uppercase tracking-widest">
                            No Image
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-0.5 px-1">
                    <h3 className="text-[14px] font-semibold text-zinc-300 truncate group-hover:text-white transition-colors duration-300">
                        {episode.show_name || episode.name}
                    </h3>
                    <p className="text-[12px] text-zinc-500 font-medium line-clamp-1">
                        {episode.name || `Episode ${episode.episode_number}`}
                    </p>
                </div>
            </div>
        </Link>
    );
}
