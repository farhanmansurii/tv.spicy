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
	const plugin = React.useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));
	const validShows = React.useMemo(
		() => shows?.filter((show) => show.backdrop_path || show.poster_path).slice(0, 4) || [],
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

	if (validShows.length === 0) return null;

	return (
		<div
			className={cn(
				'relative w-full group',
				'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]',
				'md:w-full md:left-auto md:right-auto md:ml-0 md:mr-0'
			)}
		>
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
									<HeroBanner
										show={show}
										type={(show.media_type as 'movie' | 'tv') || type}
										isDetailsPage={false}
										loading={isActive ? 'eager' : 'lazy'}
										priority={isActive}
									/>
								) : (
									<div className="h-[68vh] md:h-[80vh] lg:h-[85vh] w-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%),linear-gradient(180deg,rgba(24,24,27,0.92),rgba(9,9,11,1))]" />
								)}
							</CarouselItem>
						);
					})}
				</CarouselContent>

				{/* Navigation Buttons */}
				<div className="hidden md:flex absolute right-12 bottom-12 z-20 gap-3">
					<CarouselPrevious
						variant="ghost"
						className="static translate-y-0 h-12 w-12 rounded-full border-white/10 bg-black/40 hover:bg-white/10 text-white backdrop-blur-md transition-[background-color,color] duration-300"
					/>
					<CarouselNext
						variant="ghost"
						className="static translate-y-0 h-12 w-12 rounded-full border-white/10 bg-black/40 hover:bg-white/10 text-white backdrop-blur-md transition-[background-color,color] duration-300"
					/>
				</div>
			</Carousel>
		</div>
	);
}
