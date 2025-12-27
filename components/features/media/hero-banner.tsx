/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Badge } from '@/components/ui/badge';
import Container from '@/components/shared/containers/container';
import ContinueWatchingButton from '../watchlist/continue-watching-button';

export function HeroBanner({ show, type, isDetailsPage = false, loading = 'eager' }: any) {
    const isMobile = useMediaQuery();
    const { activeEP } = useEpisodeStore();

    const title = show.title || show.name || 'Untitled';
    const releaseYear = (show.first_air_date || show.release_date)
        ? new Date(show.first_air_date || show.release_date).getFullYear()
        : null;

    const rating = type === 'tv'
        ? show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating
        : show.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification;

    const runtime = show.episode_run_time?.[0] || show.runtime;
    const genres = show.genres?.map((g: any) => g.name).slice(0, 2).join(' • ');

    const backdrops = show.images?.backdrops || [];
    const posters = show.images?.posters || [];
    const logos = show.images?.logos || [];

    const backdrop = backdrops.find((img: any) => img.iso_639_1 === null)?.file_path || show.backdrop_path;
    const poster = posters.find((img: any) => img.iso_639_1 === null)?.file_path || show.poster_path;
    const logo = logos.find((img: any) => img.iso_639_1 === 'en')?.file_path || logos[0]?.file_path;

    const currentImage = isMobile ? poster : backdrop;

    return (
        <section className={cn(
            "relative w-full overflow-hidden bg-zinc-950",
            "h-[75vh] md:h-[80vh] lg:h-[85vh]"
        )}>
            <div className="absolute inset-0 z-0">
                <img
                    key={currentImage}
                    src={tmdbImage(currentImage, 'original')}
                    alt=""
                    className={cn(
                        "w-full h-full object-cover animate-in fade-in duration-1000",
                        isMobile ? "object-top" : "object-center"
                    )}
                    loading={loading}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_left_center,rgba(9,9,11,0.8)_0%,transparent_75%)]" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end">
                <Container className="pb-10 md:pb-20">
                    <div className="max-w-4xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">

                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3 md:mb-5">
                            <Badge className="bg-white/10 text-white border-none backdrop-blur-xl px-2 py-0.5 uppercase text-[10px] font-black tracking-widest">
                                {type === 'tv' ? 'Series' : 'Movie'}
                            </Badge>
                            <div className="flex items-center gap-2.5 text-[12px] font-bold text-zinc-400 tabular-nums">
                                {releaseYear && <span>{releaseYear}</span>}
                                {rating && <span className="border border-white/20 px-1.5 py-0.5 rounded-sm text-[10px] text-white leading-none">{rating}</span>}
                                {show.vote_average > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>{show.vote_average.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-start">
                            {logo ? (
                                <img
                                    src={tmdbImage(logo, 'w500')}
                                    alt={title}
                                    className="h-auto max-h-[70px] md:max-h-[160px] max-w-[70%] md:max-w-md object-contain object-center md:object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                                />
                            ) : (
                                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85] text-center md:text-left">
                                    {title}
                                </h1>
                            )}
                            <p className="mt-3 md:mt-4 text-[10px] md:text-xs font-black text-zinc-500 tracking-[0.3em] uppercase">
                                {genres} {runtime > 0 && ` • ${runtime}m`}
                            </p>
                        </div>

                        <div className="max-w-2xl hidden md:block mt-6 md:mt-8">
                            {isDetailsPage && type === 'tv' && activeEP ? (
                                <div className="inline-flex items-center gap-5 rounded-2xl bg-white/[0.03] border border-white/10 p-4 pr-10 backdrop-blur-3xl hover:bg-white/[0.05] transition-colors">
                                    <div className="bg-primary p-3 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                        <Play className="w-4 h-4 fill-black text-black" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-black uppercase text-primary tracking-widest opacity-80">Up Next</h4>
                                        <p className="text-white font-bold text-base leading-tight">S{activeEP.season_number} E{activeEP.episode_number}: {activeEP.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-zinc-300 text-base md:text-lg leading-relaxed line-clamp-3 font-medium opacity-90 text-balance">
                                    {show.overview}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-center md:justify-start mt-8 md:mt-10">
                             <ContinueWatchingButton id={show.id} show={show} type={type} isDetailsPage={isDetailsPage} />
                        </div>
                    </div>
                </Container>
            </div>
        </section>
    );
}
