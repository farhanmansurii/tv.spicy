'use client';

import * as React from 'react';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import { HeroBanner } from '@/components/features/media/hero-banner';
import { HERO_HEIGHT_CLASS } from '@/components/features/media/hero-height';
import { cn } from '@/lib/utils';
import type { TMDBImagesResponse, TMDBMovie, TMDBTVShow } from '@/lib/types/tmdb';

export interface HeroCarouselProps {
	shows: Array<
		Show & { media_type?: 'movie' | 'tv' } & (TMDBMovie &
				TMDBTVShow & { images?: TMDBImagesResponse })
	>;
	type: 'movie' | 'tv';
}

export default function HeroCarousel({ shows, type }: HeroCarouselProps) {
	const [api, setApi] = React.useState<import('@/components/ui/carousel').CarouselApi>();
	const [activeIndex, setActiveIndex] = React.useState(0);

	const validShows = React.useMemo(
		() => shows?.filter((show) => show.backdrop_path || show.poster_path).slice(0, 5) || [],
		[shows]
	);

	React.useEffect(() => {
		if (!api) return;
		const updateSelection = () => setActiveIndex(api.selectedScrollSnap());
		updateSelection();
		api.on('select', updateSelection);
		api.on('reInit', updateSelection);
		return () => {
			api.off('select', updateSelection);
			api.off('reInit', updateSelection);
		};
	}, [api]);

	const scrollTo = React.useCallback(
		(index: number) => {
			api?.scrollTo(index);
		},
		[api]
	);

	if (validShows.length === 0) return null;

	return (
		<div className="relative w-full group">
			<Carousel
				setApi={setApi}
				className="w-full"
				aria-label="Featured titles"
				opts={{ loop: true, align: 'start' }}
			>
				<CarouselContent className="-ml-0">
					{validShows.map((show, index) => {
						const isActive = index === activeIndex;
						const isNearActive =
							index === activeIndex ||
							index === (activeIndex + 1) % validShows.length ||
							index === (activeIndex - 1 + validShows.length) % validShows.length;

						return (
							<CarouselItem
								key={show.id}
								className="relative w-full pl-0"
								aria-label={`${show.title || show.name || 'Untitled'} (${index + 1} of ${validShows.length})`}
							>
								{isNearActive ? (
									<div
										className={cn(
											'motion-reduce:transition-none transition-opacity duration-(--duration-reveal) ease-out',
											isActive ? 'opacity-100' : 'opacity-0'
										)}
									>
										<HeroBanner
											show={show}
											type={(show.media_type as 'movie' | 'tv') || type}
											isDetailsPage={false}
											loading={isActive ? 'eager' : 'lazy'}
											priority={isActive}
											isActive={isActive}
										/>
									</div>
								) : (
									<div className={cn(HERO_HEIGHT_CLASS, 'w-full bg-background')} />
								)}
							</CarouselItem>
						);
					})}
				</CarouselContent>

				{validShows.length > 1 && (
					<div className="absolute right-4 bottom-5 z-20 hidden gap-2 md:flex lg:right-8">
						<CarouselPrevious
							variant="ghost"
							className="static h-10 w-10 translate-y-0"
						/>
						<CarouselNext
							variant="ghost"
							className="static h-10 w-10 translate-y-0"
						/>
					</div>
				)}
			</Carousel>

			<div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 md:bottom-6">
				<div className="pointer-events-auto flex items-center gap-5 md:rounded-full md:border md:border-white/10 md:bg-black/45 md:px-3 md:py-2 md:backdrop-blur-md">
					{validShows.map((show, index) => {
						const isActive = index === activeIndex;
						const title = show.title || show.name || 'Untitled';
						return (
							<button
								key={show.id}
								type="button"
								onClick={() => scrollTo(index)}
								className={cn(
									'h-1.5 w-5 rounded-full transition-opacity duration-(--duration-ui) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-2 md:w-6',
									'relative carousel-dot-hit',
									isActive
										? 'bg-white opacity-100'
										: 'bg-white opacity-40 can-hover:opacity-70'
								)}
								aria-label={`Show featured title ${title}`}
								aria-current={isActive ? 'true' : undefined}
							/>
						);
					})}
				</div>
			</div>
			<div className="sr-only" aria-live="polite">
				Selected featured title:{' '}
				{validShows[activeIndex]?.title || validShows[activeIndex]?.name}
			</div>
		</div>
	);
}
