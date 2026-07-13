'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { PauseIcon, PlayIcon } from '@phosphor-icons/react';
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
import { tmdbImage } from '@/lib/tmdb-image';
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
	const [isPaused, setIsPaused] = React.useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
	const AUTOPLAY_DELAY = 8000;

	const plugin = React.useRef(
		Autoplay({
			delay: AUTOPLAY_DELAY,
			playOnInit: false,
			stopOnInteraction: true,
		})
	);

	const validShows = React.useMemo(
		() => shows?.filter((show) => show.backdrop_path || show.poster_path).slice(0, 5) || [],
		[shows]
	);

	React.useEffect(() => {
		if (typeof window === 'undefined') return;
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		updatePreference();
		mediaQuery.addEventListener('change', updatePreference);
		return () => mediaQuery.removeEventListener('change', updatePreference);
	}, []);

	React.useEffect(() => {
		if (!api) return;
		if (validShows.length < 2 || prefersReducedMotion || isPaused) plugin.current.stop();
		else plugin.current.play();
	}, [api, isPaused, prefersReducedMotion, validShows.length]);

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

	const pauseOnInteraction = React.useCallback(() => {
		plugin.current.stop();
		setIsPaused(true);
	}, []);

	const scrollTo = React.useCallback(
		(index: number) => {
			plugin.current.stop();
			setIsPaused(true);
			api?.scrollTo(index);
		},
		[api]
	);

	const toggleAutoplay = React.useCallback(() => {
		setIsPaused((paused) => {
			const nextPaused = !paused;
			if (nextPaused || prefersReducedMotion) plugin.current.stop();
			else plugin.current.play();
			return nextPaused;
		});
	}, [prefersReducedMotion]);

	if (validShows.length === 0) return null;

	return (
		<div
			className="relative w-full group"
			onMouseEnter={() => plugin.current.stop()}
			onMouseLeave={() => {
				if (!isPaused && !prefersReducedMotion) plugin.current.play();
			}}
		>
			<Carousel
				setApi={setApi}
				plugins={[plugin.current]}
				className="w-full"
				aria-label="Featured titles"
				onPointerDown={(event) => {
					if ((event.target as HTMLElement).closest('button[aria-label*="autoplay"]')) return;
					pauseOnInteraction();
				}}
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
											'motion-reduce:transition-none transition-opacity duration-500 ease-out',
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
											prefersReducedMotion={prefersReducedMotion}
										/>
									</div>
								) : (
									<div className="h-[62dvh] min-h-[430px] md:h-[72dvh] md:min-h-[540px] w-full bg-background" />
								)}
							</CarouselItem>
						);
					})}
				</CarouselContent>

				{validShows.length > 1 && (
					<div className="absolute right-4 bottom-5 z-20 flex gap-2 lg:right-8">
						<CarouselPrevious
							variant="ghost"
							className="static hidden h-10 w-10 translate-y-0 rounded-full border-white/10 bg-background/55 text-white backdrop-blur-md hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-flex"
						/>
						<CarouselNext
							variant="ghost"
							className="static hidden h-10 w-10 translate-y-0 rounded-full border-white/10 bg-background/55 text-white backdrop-blur-md hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-flex"
						/>
						<button
							type="button"
							onClick={toggleAutoplay}
							aria-pressed={isPaused}
							aria-label={isPaused ? 'Resume featured title autoplay' : 'Pause featured title autoplay'}
							className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background/55 text-white backdrop-blur-md transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
						>
							{isPaused ? <PlayIcon size={16} weight="fill" /> : <PauseIcon size={16} weight="fill" />}
						</button>
					</div>
				)}
			</Carousel>

			<div className="border-t border-white/[0.08] bg-background/95 px-4 py-3 md:px-8 md:py-4">
				<div className="mx-auto flex max-w-7xl snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{validShows.map((show, index) => {
						const isActive = index === activeIndex;
						const title = show.title || show.name || 'Untitled';
						const year = (show.release_date || show.first_air_date)?.slice(0, 4);
						const thumbnail = show.poster_path || show.backdrop_path;
						return (
							<button
								key={show.id}
								type="button"
								onClick={() => scrollTo(index)}
								className={cn(
									'flex min-w-[150px] snap-start items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 md:min-w-0 md:flex-1',
									isActive
										? 'border-white/35 bg-white/12 text-white'
										: 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white'
								)}
								aria-label={`Show featured title ${title}${year ? `, ${year}` : ''}`}
								aria-current={isActive ? 'true' : undefined}
							>
								{thumbnail ? <img src={tmdbImage(thumbnail, 'w185')} alt="" className="h-12 w-9 shrink-0 rounded object-cover" loading="lazy" decoding="async" /> : null}
								<span className="min-w-0">
									<span className="block truncate text-sm font-semibold">{title}</span>
									{year ? <span className="block text-xs text-white/45">{year}</span> : null}
								</span>
							</button>
						);
					})}
				</div>
			</div>
			<div className="sr-only" aria-live="polite">
				Selected featured title: {validShows[activeIndex]?.title || validShows[activeIndex]?.name}
			</div>
		</div>
	);
}
