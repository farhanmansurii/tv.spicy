'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbImage } from '@/lib/tmdb-image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { MediaType, fetchCredits } from '@/lib/api';
import CastCrewLoader from '@/components/shared/loaders/cast-crew-loader';
import { DetailHeader, DetailShell } from './detail-primitives';

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
        <DetailShell>
            <div>
                <DetailHeader
                    title="Cast & Crew"
                    subtitle={isExpanded ? 'Full cast list' : 'Top billed cast'}
                    action={
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.12]"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Show less cast members' : `View all ${data.cast.length} cast members`}
                        >
                            <span suppressHydrationWarning>
                                {isExpanded ? 'Show less' : `All ${data.cast.length}`}
                            </span>
                            {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                    }
                />

                <div className="mt-2">
                    <Carousel opts={{ align: 'start', dragFree: true }} className="w-full group/row relative">
                        <CarouselContent className="-ml-4 md:-ml-6">
                            {displayedCast.map((actor: any) => (
                                <CarouselItem key={actor.id} className="pl-4 md:pl-6 basis-[35%] gap-4 flex flex-col sm:basis-[22%] lg:basis-[15%] xl:basis-[12.5%]">
                                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 transition-all duration-500 group-hover:ring-white/20 group-hover:scale-[1.02]">
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
                                        <h3 className="text-xs md:text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                                            {actor.name}
                                        </h3>
                                        <p className="text-xs font-medium text-zinc-500 line-clamp-1">
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
	        </DetailShell>
    );
}
