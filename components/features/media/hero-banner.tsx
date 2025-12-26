/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo } from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star, Plus, Info, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Container from '@/components/shared/containers/container';
import ContinueWatchingButton from '../watchlist/continue-watching-button';

export function HeroBanner({ show, type, isDetailsPage = false, loading = 'eager' }: any) {
    const isMobile = useMediaQuery();
    const { activeEP } = useEpisodeStore();

    // 1. DATA EXTRACTION
    const title = show.title || show.name || 'Untitled';
    const releaseYear = (show.first_air_date || show.release_date)
        ? new Date(show.first_air_date || show.release_date).getFullYear()
        : null;

    const rating = type === 'tv'
        ? show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating
        : show.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification;

    const runtime = show.episode_run_time?.[0] || show.runtime;
    const genres = show.genres?.map((g: any) => g.name).slice(0, 2).join(' • ');

    // 2. CLEAN IMAGE FILTERING (Industrial Standard)
    const { cleanBackdrop, cleanPoster, logo } = useMemo(() => {
        const backdrops = show.images?.backdrops || [];
        const posters = show.images?.posters || [];
        const logos = show.images?.logos || [];

        return {
            // Find backdrop with NO text (iso_639_1 is null)
            cleanBackdrop: backdrops.find((img: any) => img.iso_639_1 === null)?.file_path || show.backdrop_path,
            // Find portrait poster with NO text or English
            cleanPoster: posters.find((img: any) => img.iso_639_1 === null)?.file_path || show.poster_path,
            // Find English Logo
            logo: logos.find((img: any) => img.iso_639_1 === 'en')?.file_path || logos[0]?.file_path
        };
    }, [show]);

    const currentImage = isMobile ? cleanPoster : cleanBackdrop;

    return (
        <section className={cn(
            "relative w-full overflow-hidden bg-background top-0 left-0",
            "h-[85vh] md:h-[75vh]"
        )}>
            <div className="absolute inset-0 z-0">
                <img
                    src={tmdbImage(currentImage, 'original')}
                    alt={title}
                    className="w-full h-full object-cover object-center md:object-[center_20%] animate-in fade-in duration-1000"
                    loading={loading}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end">
                <Container className={cn(
                    "pb-10 md:pb-16",
                )}>
                    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                            <Badge className="bg-primary/20 text-primary border-none backdrop-blur-md px-3 py-1 uppercase text-[10px] font-bold">
                                {type === 'tv' ? 'Series' : 'Movie'}
                            </Badge>
                            {releaseYear && <span className="text-sm font-bold text-white/90">{releaseYear}</span>}
                            {rating && (
                                <span className="border border-white/40 px-2 py-0.5 rounded text-[10px] font-black text-white">
                                    {rating}
                                </span>
                            )}
                            {show.vote_average > 0 && (
                                <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{show.vote_average.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {/* Logo or Text Title */}
                        <div className="flex flex-col items-center md:items-start">
                            {logo ? (
                                <img
                                    src={tmdbImage(logo, 'w500')}
                                    className="max-h-[120px] md:max-h-[200px] lg:max-h-[200px] max-w-xs md:max-w-sm lg:max-w-md w-auto object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
                                    alt={title}
                                />
                            ) : (
                                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-2xl text-center md:text-left">
                                    {title}
                                </h1>
                            )}
                            <p className="mt-4 text-[10px] md:text-xs font-black text-white/50 tracking-[0.3em] uppercase">
                                {genres} {runtime > 0 && ` • ${runtime}m`}
                            </p>
                        </div>

                        {/* Overview / Episode Info */}
                        <div className="max-w-xl text-center md:text-left">
                            {isDetailsPage && type === 'tv' && activeEP ? (
                                <div className="inline-flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl hover:bg-white/10 transition-colors">
                                    <div className="bg-primary p-2.5 rounded-full shadow-lg">
                                        <Play className="w-4 h-4 fill-black text-black" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Next Up</h4>
                                        <p className="text-white font-bold text-sm">S{activeEP.season_number} E{activeEP.episode_number}: {activeEP.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/80 text-sm md:text-lg leading-relaxed line-clamp-3 font-medium drop-shadow-md">
                                    {show.overview}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <ContinueWatchingButton id={show.id} show={show} type={type} isDetailsPage={isDetailsPage} />
                    </div>
                </Container>
            </div>
        </section>
    );
}
