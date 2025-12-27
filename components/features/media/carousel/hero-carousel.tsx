'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import { HeroBanner } from '@/components/features/media/hero-banner';
import { cn } from '@/lib/utils';

interface HeroCarouselProps {
    shows: Show[];
    type: 'movie' | 'tv';
}

export default function HeroCarousel({ shows, type }: HeroCarouselProps) {
    const plugin = React.useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));
    const validShows = shows?.filter((show) => show.backdrop_path || show.poster_path) || [];

    if (validShows.length === 0) return null;

    return (
        <div className={cn(
            "relative w-full group",
            "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]",
            "md:w-full md:left-auto md:right-auto md:ml-0 md:mr-0"
        )}>
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                opts={{
                    loop: true,
                    align: 'start',
                }}
            >
                <CarouselContent className="-ml-0">
                    {validShows.slice(0, 10).map((show, index) => (
                        <CarouselItem key={show.id} className="pl-0 relative w-full">
                            <HeroBanner
                                show={show}
                                type={type}
                                isDetailsPage={false}
                                loading={index < 3 ? 'eager' : 'lazy'}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation Buttons */}
                <div className="hidden md:flex absolute right-12 bottom-12 z-20 gap-3">
                    <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-full border-white/10 bg-black/40 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300 will-change-transform" />
                    <CarouselNext className="static translate-y-0 h-12 w-12 rounded-full border-white/10 bg-black/40 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300 will-change-transform" />
                </div>
            </Carousel>
        </div>
    );
}
