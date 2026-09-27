'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useGSAP } from '@gsap/react';
import { usePathname } from 'next/navigation';
import Container from '@/components/shared/containers/container';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import { EDITORIAL_HERO_HEIGHT_CLASS } from '@/components/features/media/hero-height';
import type { HeroCarouselProps } from '@/components/features/media/carousel/hero-carousel';
import { EditorialHeroRail, padIndex } from '@/components/features/home/editorial-hero-rail';
import { parseTitleParts } from '@/components/ui/title-display';
import { tmdbImage } from '@/lib/tmdb-image';
import { openingTitleCard, reelChange, useReducedMotion, type ReelController } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useHaptics } from '@/hooks/use-haptics';

type HeroShow = HeroCarouselProps['shows'][number];

const MAX_SLIDES = 5;
const BACKDROP_HOLD_MS = 460;
const LONG_TITLE_CHARS = 20;

function toSlide(show: HeroShow, fallbackType?: 'movie' | 'tv') {
	const backdrop =
		show.images?.backdrops?.find((image) => image.iso_639_1 === null)?.file_path ||
		show.backdrop_path ||
		show.poster_path ||
		null;
	const releaseDate = show.release_date || show.first_air_date;
	const resolvedType: 'movie' | 'tv' =
		fallbackType ??
		(show.media_type === 'movie' || show.media_type === 'tv'
			? show.media_type
			: 'title' in show && Boolean(show.title)
				? 'movie'
				: 'tv');

	return {
		show,
		id: show.id,
		type: resolvedType,
		title: show.title || show.name || 'Untitled',
		year: releaseDate ? releaseDate.slice(0, 4) : null,
		score: show.vote_average ?? 0,
		backdrop,
		poster: show.poster_path || null,
	};
}

interface ReelRequest {
	index: number;
	instant: boolean;
	from: number;
}

export function EditorialHero({
	shows,
	type,
}: {
	shows: HeroShow[];
	type?: 'movie' | 'tv';
}) {
	const slides = useMemo(
		() =>
			shows
				.filter((show) => show.backdrop_path || show.poster_path)
				.slice(0, MAX_SLIDES)
				.map((show) => toSlide(show, type)),
		[shows, type]
	);
	const reducedMotion = useReducedMotion();
	const haptic = useHaptics();
	const pathname = usePathname();
	const hasMounted = useHasMounted();
	const [current, setCurrent] = useState(0);
	const [previous, setPrevious] = useState<number | null>(null);
	const [requested, setRequested] = useState<ReelRequest | null>(null);
	const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
	const [isPaused, setIsPaused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const heroRef = useRef<HTMLElement>(null);
	const reelRef = useRef<ReelController | null>(null);
	const openingRef = useRef<{ interrupt: () => void } | null>(null);
	const currentRef = useRef(0);
	const swappedRef = useRef(false);

	const goTo = useCallback(
		(next: number, instant = false, source: 'user' | 'auto' = 'user') => {
			if (next === current) return;
			if (source === 'user') haptic('selection');
			openingRef.current?.interrupt();
			setRequested({ index: next, instant, from: current });
		},
		[current, haptic]
	);

	const markLoaded = useCallback((index: number) => {
		setLoaded((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
	}, []);

	const backdropWindow = useMemo(
		() =>
			new Set(
				[current, previous, requested?.index, (current + 1) % slides.length].filter(
					(index): index is number => typeof index === 'number'
				)
			),
		[current, previous, requested, slides.length]
	);

	useGSAP(
		() => {
			if (!heroRef.current) return;
			reelRef.current = reelChange(heroRef.current, {
				onSwap: (index) => {
					swappedRef.current = true;
					// Synchronous so the arriving copy starts hidden in the same frame it is swapped in.
					flushSync(() => {
						setPrevious(currentRef.current);
						setCurrent(index);
					});
				},
			});
		},
		{ scope: heroRef }
	);

	useGSAP(
		() => {
			if (!requested) return;
			reelRef.current?.select(requested.index, {
				from: requested.from,
				immediate: requested.instant,
			});
		},
		{ scope: heroRef, dependencies: [requested] }
	);

	useGSAP(
		() => {
			if (!swappedRef.current) return;
			swappedRef.current = false;
			reelRef.current?.enter();
			setRequested(null);
		},
		{ scope: heroRef, dependencies: [current] }
	);

	useEffect(() => {
		currentRef.current = current;
	}, [current]);

	useEffect(() => {
		if (previous === null) return;
		const timer = setTimeout(() => setPrevious(null), BACKDROP_HOLD_MS);
		return () => clearTimeout(timer);
	}, [previous]);

	useEffect(
		() => () => {
			reelRef.current?.destroy();
			reelRef.current = null;
		},
		[]
	);

	useEffect(() => {
		if (pathname !== '/' || !hasMounted || !heroRef.current) return;
		openingRef.current = openingTitleCard(heroRef.current);
		return () => {
			openingRef.current?.interrupt();
			openingRef.current = null;
		};
	}, [hasMounted, pathname]);

	if (slides.length === 0) return null;

	const slide = slides[current];
	const { main: titleMain, subtitle: titleSubtitle } = parseTitleParts(slide.title);

	return (
		<section
			ref={heroRef}
			aria-roledescription="carousel"
			aria-label="Featured titles"
			onFocusCapture={(event) => {
				if (event.target.matches(':focus-visible')) setIsFocused(true);
			}}
			onBlurCapture={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setIsFocused(false);
				}
			}}
			className={cn(
				'relative isolate flex flex-col justify-end overflow-hidden pt-24 pb-6 lg:pb-8',
				EDITORIAL_HERO_HEIGHT_CLASS
			)}
		>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 -z-30 bg-gradient-band hero-backdrop lg:hero-backdrop-lg"
			>
				{slides.map((item, index) =>
					item.backdrop && backdropWindow.has(index) ? (
						<img
							key={item.id}
							data-reel-backdrop={index}
							ref={(node) => {
								if (node?.complete && node.naturalWidth > 0) markLoaded(index);
							}}
							src={tmdbImage(item.backdrop, 'w1280')}
							srcSet={`${tmdbImage(item.backdrop, 'w780')} 780w, ${tmdbImage(item.backdrop, 'w1280')} 1280w`}
							sizes="(min-width: 1024px) 76vw, 100vw"
							alt=""
							decoding="async"
							fetchPriority={index === 0 ? 'high' : 'low'}
							onLoad={() => markLoaded(index)}
							onError={() => markLoaded(index)}
							className={cn(
								'absolute inset-0 size-full object-cover hero-backdrop-img opacity-0 lg:hero-backdrop-img-lg',
								'transition-opacity duration-(--duration-reveal) ease-entrance motion-reduce:transition-none',
								index === previous && 'z-1 opacity-100',
								index === current && loaded.has(index) && 'z-2 opacity-100',
								index === requested?.index && 'transition-none'
							)}
						/>
					) : null
				)}
			</div>

			<div
				aria-hidden="true"
				className="absolute inset-0 -z-20 bg-linear-to-b from-background/70 to-transparent to-20%"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-20 bg-linear-to-t from-background from-26% via-background/85 via-44% to-transparent to-78% lg:bg-linear-to-r lg:from-18% lg:via-background/55 lg:via-40% lg:to-62%"
			/>

			<div
				data-reel-ghost
				aria-hidden="true"
				className="pointer-events-none absolute top-18 right-4 -z-10 font-display hero-ghost text-transparent select-none sm:right-6 lg:top-auto lg:right-8 lg:bottom-37.5"
			>
				<span data-reel-ghost="in" className="block">
					{padIndex(current + 1)}
				</span>
				<span data-reel-ghost="out" className="absolute inset-0 block">
					{previous === null ? '' : padIndex(previous + 1)}
				</span>
			</div>

			<Container className="relative">
				<div
					data-reel-copy
					className="max-w-195"
					aria-live={isPaused || (hasMounted && reducedMotion) ? 'polite' : 'off'}
					aria-atomic="true"
				>
					<p
						data-reel-slate
						className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm leading-tight tracking-label text-white/60 uppercase"
					>
						<span>
							<span className="text-brand">{padIndex(current + 1)}</span> /{' '}
							{padIndex(slides.length)}
						</span>
						<span aria-hidden="true" className="h-px w-7 bg-current opacity-60" />
						<span>{slide.type === 'tv' ? 'Series' : 'Movie'}</span>
						{slide.year && <span>{slide.year}</span>}
					</p>

					<h1
						className={cn(
							'mt-4 mb-4.5 font-display text-balance uppercase break-anywhere',
							titleMain.length > LONG_TITLE_CHARS ? 'text-display-long' : 'text-display-hero'
						)}
					>
						<span data-reel-title className="block">
							{titleMain}
						</span>
						{titleSubtitle && (
							<span
								data-reel-sub
								className="mt-3 block font-display uppercase text-display-3 tracking-normal"
							>
								{titleSubtitle}
							</span>
						)}
					</h1>

					{slide.score > 0 && (
						<p data-reel-score className="mb-6 flex items-baseline gap-2.5">
							<span className="font-display text-display-3 leading-none">
								{slide.score.toFixed(1)}
							</span>
							<span className="font-mono text-sm leading-none tracking-label text-white/60 uppercase">
								/ 10
							</span>
						</p>
					)}

					<div data-reel-actions>
						<ContinueWatchingButton
							id={slide.id}
							show={slide.show}
							type={slide.type}
							tone="brand"
						/>
					</div>
				</div>

				{slides.length > 1 && (
					<div data-reel-rail>
						<EditorialHeroRail
							items={slides.map(({ id, title, poster }) => ({ id, title, poster }))}
							current={current}
							isPaused={isPaused}
							isHeld={isHovered || isFocused}
							onSelect={goTo}
							onAdvance={() => goTo((current + 1) % slides.length, false, 'auto')}
							onTogglePause={() => setIsPaused((value) => !value)}
							onHoldChange={setIsHovered}
						/>
					</div>
				)}
			</Container>
		</section>
	);
}
