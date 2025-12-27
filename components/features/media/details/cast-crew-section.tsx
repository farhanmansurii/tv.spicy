/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbImage } from '@/lib/tmdb-image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { User } from 'lucide-react';
import { MediaType, fetchCredits } from '@/lib/api';
import CommonTitle from '@/components/shared/animated/common-title';
import CastCrewLoader from '@/components/shared/loaders/cast-crew-loader';

export default function CastCrewSection({ id, type }: { id: string; type: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['credits', id, type],
        queryFn: () => fetchCredits(id, type as MediaType),
    });

    if (isLoading) return <CastCrewLoader />;
    if (!data?.cast?.length) return null;

    return (
        <div className="w-full space-y-10 animate-in fade-in duration-1000">
            <div>
                <CommonTitle text="The Ensemble" variant="section" spacing="none" />
                <CommonTitle text="Leading Cast" variant="small" spacing="medium">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest tabular-nums">
                        {data.cast.length} Members
                    </span>
                </CommonTitle>

                <Carousel opts={{ align: 'start', dragFree: true }} className="w-full group/row relative">
                    <CarouselContent className="-ml-4 md:-ml-6">
                        {data.cast.slice(0, 12).map((actor: any) => (
                            <CarouselItem key={actor.id} className="pl-4 md:pl-6 basis-[35%] sm:basis-[22%] lg:basis-[15%] xl:basis-[12.5%]">
                                <div className="flex flex-col items-center gap-4 group cursor-pointer">
                                    <div className="relative aspect-square w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/10 transition-all duration-500 group-hover:ring-primary/50 group-hover:scale-105">
                                        {actor.profile_path ? (
                                            <img src={tmdbImage(actor.profile_path, 'w500')} alt="" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-white/[0.03]"><User className="w-6 h-6 text-white/10" /></div>
                                        )}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-primary transition-colors line-clamp-1">{actor.name}</h3>
                                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider line-clamp-1">{actor.character}</p>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
}
