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
	const [progress, setProgress] = React.useState(0);
	const progressIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
	const AUTOPLAY_DELAY = 8000;

	const plugin = React.useRef(
		Autoplay({
			delay: AUTOPLAY_DELAY,
			stopOnInteraction: true,
			stopOnMouseEnter: true,
		})
	);

	const validShows = React.useMemo(
		() => shows?.filter((show) => show.backdrop_path || show.poster_path).slice(0, 5) || [],
		[shows]
	);

	// Progress bar animation
	React.useEffect(() => {
		if (!api) return;

		const startProgress = () => {
			setProgress(0);
			if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

			const startTime = Date.now();
			progressIntervalRef.current = setInterval(() => {
				const elapsed = Date.now() - startTime;
				const newProgress = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
				setProgress(newProgress);
			}, 50);
		};

		const stopProgress = () => {
			if (progressIntervalRef.current) {
				clearInterval(progressIntervalRef.current);
				progressIntervalRef.current = null;
			}
			setProgress(0);
		};

		api.on('select', startProgress);
		api.on('settle', startProgress);
		api.on('pointerDown', stopProgress);

		startProgress();

		return () => {
			stopProgress();
			api.off('select', startProgress);
			api.off('settle', startProgress);
			api.off('pointerDown', stopProgress);
		};
	}, [api]);

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
				plugins={[plugin.current]}
				className="w-full"
				opts={{
					loop: true,
					align: 'start',
				}}
			>
				<CarouselContent className="-ml-0">
					{validShows.map((show, index) => {
						const isActive = index === activeIndex;
						const isNearActive =
							index === activeIndex ||
							index === (activeIndex + 1) % validShows.length ||
							index === (activeIndex - 1 + validShows.length) % validShows.length;

						return (
							<CarouselItem key={show.id} className="pl-0 relative w-full">
								{isNearActive ? (
									<div
										className={cn(
											'transition-opacity duration-700 ease-in-out',
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
									<div className="h-[70vh] md:h-[82vh] lg:h-[88vh] w-full bg-background" />
								)}
							</CarouselItem>
						);
					})}
				</CarouselContent>

				{/* Navigation Buttons — Apple TV style: minimal, bottom right */}
				<div className="hidden md:flex absolute right-8 lg:right-12 bottom-20 z-20 gap-2">
					<CarouselPrevious
						variant="ghost"
						className="static translate-y-0 h-10 w-10 rounded-full border-white/10 bg-background/55 hover:bg-white/15 text-white backdrop-blur-md transition-all duration-300 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
					/>
					<CarouselNext
						variant="ghost"
						className="static translate-y-0 h-10 w-10 rounded-full border-white/10 bg-background/55 hover:bg-white/15 text-white backdrop-blur-md transition-all duration-300 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
					/>
				</div>
			</Carousel>

			{/* Apple TV-style segmented progress indicators */}
			<div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 flex justify-center">
				<div className="flex items-center gap-1.5 md:gap-2">
					{validShows.map((_, index) => {
						const isActive = index === activeIndex;
						return (
							<button
								key={index}
								onClick={() => scrollTo(index)}
								className={cn(
									'group relative h-1 rounded-full overflow-hidden transition-all duration-500',
									isActive
										? 'w-8 md:w-12 bg-white/20'
										: 'w-4 md:w-6 bg-white/10 hover:bg-white/20'
								)}
								aria-label={`Go to slide ${index + 1}`}
								aria-current={isActive ? 'true' : undefined}
							>
								{isActive && (
									<div
										className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100 ease-linear"
										style={{ width: `${progress}%` }}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
