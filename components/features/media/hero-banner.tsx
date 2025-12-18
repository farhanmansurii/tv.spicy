/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-hook';

export function HeroBanner({ id, show, type, isDetailsPage = false, enableHover = false, loading = 'lazy' }: any) {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const releaseYear = (show.first_air_date || show.release_date) ? new Date(show.first_air_date || show.release_date).getFullYear() : '';
    const rating = show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || 'TV-MA';

    // Image logic: prefer universal/blank images (iso_639_1 === null), fallback to defaults
    const allPosters = (show.images?.posters || []).filter((img: any) => img.iso_639_1 === null);
    const universalBackdrops = (show.images?.backdrops || []).filter((img: any) => img.iso_639_1 === null);

    const posterPath = allPosters[0]?.file_path || show.poster_path;

    const backdropPath = isMobile
        ? posterPath
        : universalBackdrops[0]?.file_path || show.backdrop_path || show.poster_path;

    const logo =
        show.images?.logos?.find((img: any) => img.iso_639_1 === 'en')?.file_path ||
        show.images?.logos?.find((img: any) => img.iso_639_1 === null)?.file_path ||
        show.images?.logos?.[0]?.file_path;

    return (
        <div className="w-full animate-in fade-in duration-700 px-0">
            <div className={cn(
                'relative w-full overflow-hidden border border-border bg-background shadow-2xl',
                'aspect-[2/3] md:aspect-[21/9] lg:aspect-[16/7] rounded-hero md:rounded-hero-md',
                enableHover && 'group'
            )}>
                {/* 1. MEDIA LAYER */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={tmdbImage(backdropPath, 'original')}
                        alt={show.title || show.name}
                        className={cn('w-full h-full object-cover opacity-60 md:opacity-75', enableHover && 'transition-transform duration-[3s] group-hover:scale-105')}
                        loading={loading}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden md:block" />
                </div>

                {/* 2. CONTENT LAYER - Tightened Padding & Spacing */}
                <div className="relative z-10 h-full w-full flex flex-col justify-end p-6 md:p-10 lg:p-14">
                    <div className="max-w-4xl space-y-3 md:space-y-4 text-left">

                        {/* Title Section */}
                        <div className="space-y-2 md:space-y-3">
                            {logo ? (
                                <div className="max-w-[180px] md:max-w-[380px] lg:max-w-[480px]">
                                    <img
                                        src={tmdbImage(logo, 'w500')}
                                        className="w-full h-auto object-contain drop-shadow-2xl"
                                        alt={show.title || show.name}
                                    />
                                </div>
                            ) : (
                                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                                    {show.title || show.name}
                                </h1>
                            )}

                            {/* Genres Ribbon */}
                            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                {show.genres?.slice(0, 3).map((genre: any, index: number) => (
                                    <React.Fragment key={index}>
                                        <span className="hover:text-foreground transition-colors">{typeof genre === 'string' ? genre : genre.name}</span>
                                        {index < 2 && index < (show.genres?.length - 1) && <span className="text-muted-foreground/30">•</span>}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-[10px] md:text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="flex items-center gap-1.5 text-yellow-500/90">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span>{Math.round(show.vote_average * 10)}% Match</span>
                                </div>
                                <span className="opacity-30">/</span>
                                <span>{releaseYear}</span>
                                <span className="opacity-30">/</span>
                                <span className="px-1.5 py-0.5 rounded border border-border bg-foreground/5 text-[9px] font-black">{rating}</span>
                            </div>
                        </div>

                        {/* Description - Tightened line height and margin */}
                        {show.overview && (
                            <p className="text-foreground/80 text-sm md:text-lg leading-snug md:leading-relaxed font-medium italic line-clamp-2 md:line-clamp-2 max-w-2xl opacity-90">
                                {show.overview}
                            </p>
                        )}

                        {/* Button Row */}
                        <div className="pt-1 md:pt-2">
                            <ContinueWatchingButton id={id} show={show} type={type} isDetailsPage={isDetailsPage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
