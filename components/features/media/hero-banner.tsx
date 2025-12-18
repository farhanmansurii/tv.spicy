/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import { ChevronRight, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import { useEpisodeStore } from '@/store/episodeStore';

export function HeroBanner({ id, show, type, isDetailsPage = false, loading = 'lazy' }: any) {
    const isMobile = useMediaQuery();
    const { activeEP } = useEpisodeStore();

    const releaseYear = (show.first_air_date || show.release_date)
        ? new Date(show.first_air_date || show.release_date).getFullYear()
        : '';

    const rating = type === 'tv'
        ? show.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating
        : show.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification;

    const runtime = show.episode_run_time?.[0] || show.runtime;
    const genres = show.genres?.map((g: any) => g.name).join(' · ');

    const posterPath = show.images?.posters?.find((img: any) => img.iso_639_1 === null)?.file_path || show.poster_path;
    const backdropPath = show.images?.backdrops?.find((img: any) => img.iso_639_1 === null)?.file_path || show.backdrop_path;

    // On Desktop we strictly want Backdrop, on Mobile we prefer Poster
    const currentImage = isMobile ? (posterPath || backdropPath) : (backdropPath || posterPath);

    const logo = show.images?.logos?.find((img: any) => img.iso_639_1 === 'en')?.file_path ||
                 show.images?.logos?.[0]?.file_path;

    // Build metadata items array
    const metadataItems = [];
    if (releaseYear) metadataItems.push({ type: 'text', content: releaseYear });
    if (type === 'movie' && runtime) metadataItems.push({ type: 'text', content: `${runtime} min` });
    if (type === 'tv' && show.number_of_seasons) {
        metadataItems.push({ type: 'text', content: `${show.number_of_seasons} ${show.number_of_seasons === 1 ? 'Season' : 'Seasons'}` });
    }
    if (type === 'tv' && show.number_of_episodes) {
        metadataItems.push({ type: 'text', content: `${show.number_of_episodes} ${show.number_of_episodes === 1 ? 'Episode' : 'Episodes'}` });
    }
    if (rating) metadataItems.push({ type: 'rating', content: rating });
    if (show.vote_average && show.vote_average > 0) {
        metadataItems.push({ type: 'vote', content: show.vote_average.toFixed(1) });
    }

    return (
        <div className="relative w-full overflow-hidden group rounded-hero md:rounded-hero-md">
            <div className={cn(
                "relative w-full transition-transform duration-1000 ease-out overflow-hidden",
                "aspect-[2/3] md:aspect-video lg:aspect-[16/8]",
                'rounded-hero md:rounded-hero-md',
            )}>
                <img
                    src={tmdbImage(currentImage, 'original')}
                    alt={show.title || show.name}
                    className="w-full h-full object-cover rounded-hero md:rounded-hero-md scale-105 group-hover:scale-100 transition-transform duration-1000"
                    loading={loading}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/20 md:to-transparent rounded-hero md:rounded-hero-md" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent hidden md:block rounded-hero md:rounded-hero-md" />

                {/* Gradient blur effect similar to episode card */}
                <div
                    className={cn(
                        "absolute inset-0 z-10 transition-opacity duration-500 rounded-hero md:rounded-hero-md",
                        "backdrop-blur-[5px] opacity-100"
                    )}
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 85%, black 100%)',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 45%, black 85%, black 100%)',
                    }}
                />
            </div>

            <div className={cn(
                "absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-16 md:pb-20",
                "items-center text-center md:items-start md:text-left z-20"
            )}>



                <div className="w-full max-w-[280px] md:max-w-[300px] mb-2 md:mb-4  lg:max-w-[500px] flex items-center justify-center md:block">
                    {logo ? (
                        <img
                            src={tmdbImage(logo, 'w500')}
                            className="max-h-[80px] md:max-h-[140px] w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] md:object-left"
                            alt={show.title || show.name}
                        />
                    ) : (
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic">
                            {show.title || show.name}
                        </h1>
                    )}
                </div>

                <div className="flex items-center gap-2 text-white/70 mb-2 flex-wrap justify-center md:justify-start md:mb-4 text-[11px] md:text-[12px] font-semibold ">
                    <span className=" rounded-card text px-2 border-2 border-white/20 whitespace-nowrap font-black">{type === 'tv' ? 'TV Show' : 'Movie'}</span>
                    {genres && (
                        <>
                            <span className="text-white/40 font-light text-xl">·</span>
                            <span className="line-clamp-1">{genres}</span>
                        </>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 mb-2 md:mb-4 w-full md:w-auto">
                    <ContinueWatchingButton
                        id={id}
                        show={show}
                        type={type}
                        isDetailsPage={isDetailsPage}
                        className="w-full md:w-auto h-11 px-8 text-lg"
                    />

                </div>
                <div className="max-w-2xl space-y-3">
                    {isDetailsPage && type === 'tv' && activeEP ? (
                        <p className="text-white text-[15px] md:text-[17px] font-medium leading-snug">
                            <span className="font-bold block md:inline mb-1 md:mb-0">
                                S{activeEP.season_number}, E{activeEP.episode_number} · {activeEP.name}:
                            </span>
                            <span className="opacity-80  block line-clamp-2 md:line-clamp-3">
                                {activeEP.overview || show.overview}
                            </span>
                        </p>
                    ) : (
                        <p className="text-white/80 text-[12px] md:text-[14px] leading-relaxed line-clamp-2 md:line-clamp-3">
                            {show.overview}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 text-[11px] font-bold text-white/40 tracking-widest uppercase leading-none">
                        {metadataItems.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.type === 'text' && (
                                    <span className="flex items-center">{item.content}</span>
                                )}
                                {item.type === 'rating' && (
                                    <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded-sm font-bold flex items-center leading-none">{item.content}</span>
                                )}
                                {item.type === 'vote' && (
                                    <span className="border border-white/20 px-1.5 py-0.5 rounded-sm flex items-center gap-1 leading-none">
                                        <Star className="w-3 h-3 fill-white/40 text-white/40" />
                                        {item.content}
                                    </span>
                                )}
                                {index < metadataItems.length - 1 && (
                                    <span className="text-white/20 text-base md:text-lg">·</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
