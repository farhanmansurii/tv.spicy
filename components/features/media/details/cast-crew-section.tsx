/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbImage } from '@/lib/tmdb-image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { MediaType, fetchCredits } from '@/lib/api';
import CommonTitle from '@/components/shared/animated/common-title';
import CastCrewLoader from '@/components/shared/loaders/cast-crew-loader';
import { cn } from '@/lib/utils';

export default function CastCrewSection({ id, type }: { id: string; type: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ['credits', id, type],
        queryFn: () => fetchCredits(id, type as MediaType),
    });

    if (isLoading) return <CastCrewLoader />;
    if (!data?.cast?.length) return null;

    const displayedCast = isExpanded ? data.cast : data.cast.slice(0, 8);

    return (
        <div className="w-full py-8 md:py-12">
            <div>
                <CommonTitle text="Cast & Crew" variant="section" spacing="none" />
                <CommonTitle text="Meet the Cast" variant="small" spacing="medium">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Show less cast members' : `View all ${data.cast.length} cast members`}
                    >
                        <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest tabular-nums group-hover:text-white transition-colors" suppressHydrationWarning>
                            {isExpanded ? 'Show Less' : `View All ${data.cast.length} Members`}
                        </span>
                        {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                        )}
                    </button>
                </CommonTitle>

                <div className="mt-6 md:mt-8">
                    <Carousel opts={{ align: 'start', dragFree: true }} className="w-full group/row relative">
                        <CarouselContent className="-ml-4 md:-ml-6">
                            {displayedCast.map((actor: any) => (
                                <CarouselItem key={actor.id} className="pl-4 md:pl-6 basis-[35%] gap-4 flex flex-col sm:basis-[22%] lg:basis-[15%] xl:basis-[12.5%]">
                                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10 transition-all duration-500 group-hover:ring-primary/50 group-hover:scale-105">
                                        {actor.profile_path ? (
                                            <img
                                                src={tmdbImage(actor.profile_path, 'w500')}
                                                alt={actor.name}
                                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-white/[0.03]">
                                                <User className="w-6 h-6 text-white/10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center space-y-0.5 w-full mt-2">
                                        <h3 className="text-xs md:text-sm font-bold text-zinc-100 group-hover:text-primary transition-colors line-clamp-1">
                                            {actor.name}
                                        </h3>
                                        <p className="text-[9px] md:text-[10px] font-medium text-zinc-500 uppercase tracking-wider line-clamp-1">
                                            {actor.character}
                                        </p>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden lg:flex absolute left-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-full" />
                        <CarouselNext className="hidden lg:flex absolute right-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-full" />
                    </Carousel>
                </div>
            </div>
        </div>
    );
}
