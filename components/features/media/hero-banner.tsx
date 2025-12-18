/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';

export function HeroBanner({ id, show, type, isDetailsPage = false, enableHover = false, loading = 'lazy' }: any) {
    const isMobile = useMediaQuery();

    const releaseYear = (show.first_air_date || show.release_date)
        ? new Date(show.first_air_date || show.release_date).getFullYear()
        : '';

    const rating = show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating || 'TV-MA';

    const posterPath = show.images?.posters?.find((img: any) => img.iso_639_1 === null)?.file_path || show.poster_path;
    const backdropPath = show.images?.backdrops?.find((img: any) => img.iso_639_1 === null)?.file_path || show.backdrop_path;

    const currentImage = isMobile ? (posterPath || backdropPath) : (backdropPath || posterPath);

    const logo =
        show.images?.logos?.find((img: any) => img.iso_639_1 === 'en')?.file_path ||
        show.images?.logos?.find((img: any) => img.iso_639_1 === null)?.file_path ||
        show.images?.logos?.[0]?.file_path;

    return (
        <div className="w-full animate-in fade-in duration-700 px-0">
            <div className={cn(
                'relative w-full overflow-hidden border border-border bg-background shadow-2xl transition-all duration-500',
                'aspect-[2/3] sm:aspect-square md:aspect-video lg:aspect-[21/9] xl:aspect-[16/7]',
                'min-h-[520px] sm:min-h-[600px] md:min-h-0',
                'rounded-hero md:rounded-hero-md',
                enableHover && 'group'
            )}>
                <div className="absolute inset-0 z-0">
                    <img
                        key={currentImage}
                        src={tmdbImage(currentImage, 'original')}
                        alt={show.title || show.name}
                        className={cn(
                            'w-full h-full object-cover transition-opacity duration-1000',
                            isMobile ? 'opacity-90' : 'opacity-60 md:opacity-80',
                            enableHover && 'transition-transform duration-[3s] group-hover:scale-105'
                        )}
                        loading={loading}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 sm:via-background/40 md:via-background/10 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent hidden md:block" />
                    <div className="absolute inset-0 bg-black/40 sm:bg-black/20 md:hidden" />
                </div>

                <div className="relative z-10 h-full w-full flex flex-col justify-end p-6 sm:p-10 md:p-12 lg:p-16">
                    <div className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl space-y-5">

                        <div className="space-y-4">
                            {logo ? (
                                <div className="w-[160px] xs:w-[200px] sm:w-[300px] md:w-[350px] lg:w-[400px]">
                                    <img
                                        src={tmdbImage(logo, 'w500')}
                                        className="w-full h-auto object-contain drop-shadow-[0_12px_12px_rgba(0,0,0,0.6)]"
                                        alt={show.title || show.name}
                                    />
                                </div>
                            ) : (
                                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-[0.85] drop-shadow-2xl">
                                    {show.title || show.name}
                                </h1>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-[12px] font-black text-white md:text-muted-foreground uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-1.5 text-yellow-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span>{Math.round(show.vote_average * 10)}% Match</span>
                                </div>
                                <span className="opacity-30">/</span>
                                <span>{releaseYear}</span>
                                <span className="opacity-30">/</span>
                                <span className="px-2 py-0.5 rounded border border-white/30 md:border-border bg-black/40 md:bg-foreground/5 font-black">
                                    {rating}
                                </span>
                            </div>
                        </div>

                        {show.overview && (
                            <p className="text-white sm:text-foreground/90 text-sm sm:text-base md:text-lg leading-snug sm:leading-relaxed font-medium italic line-clamp-4 sm:line-clamp-5 md:line-clamp-2 max-w-2xl drop-shadow-md">
                                {show.overview}
                            </p>
                        )}

                        <div className="pt-2 sm:pt-4">
                            <ContinueWatchingButton id={id} show={show} type={type} isDetailsPage={isDetailsPage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
