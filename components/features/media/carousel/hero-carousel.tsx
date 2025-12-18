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

interface HeroCarouselProps {
    shows: Show[];
    type: 'movie' | 'tv';
}

export default function HeroCarousel({ shows, type }: HeroCarouselProps) {
    const plugin = React.useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));
    const validShows = shows?.filter((show) => show.backdrop_path || show.poster_path) || [];

    if (validShows.length === 0) return null;

    return (
        <div className="relative w-full group px-0 md:px-0">
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
                                id={show.id}
                                show={show}
                                type={type}
                                isDetailsPage={false}
                                enableHover={true}
                                loading={index === 0 ? 'eager' : 'lazy'}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation Buttons (Apple Glass Pill Style) */}
                <div className="hidden md:flex absolute right-12 bottom-12 z-20 gap-3">
                    <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-full border-white/10 bg-black/40 hover:bg-white/10 text-white backdrop-blur-3xl transition-all duration-300" />
                    <CarouselNext className="static translate-y-0 h-14 w-14 rounded-full border-white/10 bg-black/40 hover:bg-white/10 text-white backdrop-blur-3xl transition-all duration-300" />
                </div>
            </Carousel>
        </div>
    );
}
