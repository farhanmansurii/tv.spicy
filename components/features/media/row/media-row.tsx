'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { revealOnScroll } from '@/lib/motion';
import { useHaptics } from '@/hooks/use-haptics';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Show } from '@/lib/types';
import MediaCard from '@/components/features/media/card/media-card';
import { cn } from '@/lib/utils';

interface MediaRowProps {
	shows: Show[];
	text?: string;
	type: string;
	isVertical?: boolean;
	viewAllLink?: string;
	hideHeader?: boolean;
	headerAction?: React.ReactNode;
	gridLayout?: boolean;
	ranked?: boolean;
	rowNumber?: number;
}

function MediaRowComponent({
	shows,
	text,
	type,
	isVertical,
	viewAllLink,
	hideHeader = false,
	headerAction,
	gridLayout = false,
	ranked = false,
	rowNumber,
}: MediaRowProps) {
	const effectiveIsVertical = isVertical ?? false;
	const visualIsVertical = effectiveIsVertical || ranked;
	const carouselItemBasis = ranked
		? 'basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
		: effectiveIsVertical
			? 'basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
			: 'basis-7/10 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4';

	const sectionRef = useRef<HTMLElement>(null);
	const [api, setApi] = useState<CarouselApi>();
	const [canScroll, setCanScroll] = useState({ prev: false, next: true });
	const haptic = useHaptics();
	const atEndNudgedRef = useRef(false);

	// Arrow paging travels for half a second; reduced motion jumps instead. Read
	// once so embla never re-inits and drops the row back to its first card.
	const [scrollDuration] = useState(() =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
			? 0
			: 30
	);
	const carouselOpts = useMemo(
		() => ({
			align: 'start' as const,
			dragFree: true,
			containScroll: 'trimSnaps' as const,
			duration: scrollDuration,
		}),
		[scrollDuration]
	);

	useEffect(() => {
		if (!api) return;

		const updateBoundaries = () => {
			const next = api.canScrollNext();
			setCanScroll({ prev: api.canScrollPrev(), next });
			// Nudge once per arrival at the last card, driven by the settled scroll
			// position rather than the arrow press. A row that fits entirely never
			// nudged, because the end is where it started.
			if (next) {
				atEndNudgedRef.current = false;
			} else if (!atEndNudgedRef.current && api.canScrollPrev()) {
				atEndNudgedRef.current = true;
				haptic('nudge');
			}
		};

		updateBoundaries();
		api.on('select', updateBoundaries);
		api.on('reInit', updateBoundaries);

		return () => {
			api.off('select', updateBoundaries);
			api.off('reInit', updateBoundaries);
		};
	}, [api, haptic]);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;
		return revealOnScroll(
			section,
			section.querySelectorAll<HTMLElement>('[data-row-reveal-header]'),
			section.querySelectorAll<HTMLElement>('[data-row-reveal-card]')
		);
	}, []);

	const validShows = useMemo(() => {
		if (!shows) return [];
		if (isVertical !== undefined) {
			return shows.filter((show: Show) =>
				isVertical ? !!show.poster_path : !!show.backdrop_path
			);
		}
		return shows.filter((show: Show) => !!show.backdrop_path || !!show.poster_path);
	}, [shows, isVertical]);

	const handleRowKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		// Keyboard actions never animate: jump one card and keep the carousel's
		// smooth handler from also running on the same press.
		event.preventDefault();
		event.stopPropagation();
		if (event.key === 'ArrowLeft') api?.scrollPrev(true);
		else api?.scrollNext(true);
	};

	if (validShows.length === 0) return null;

	const renderGrid = () => (
		<div
			className={cn(
				'grid gap-4 px-gutter md:gap-6',
				visualIsVertical
					? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
					: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
			)}
		>
			{validShows.map((show: Show, index: number) => (
				<div key={show.id} data-row-reveal-card>
					<MediaCard
						type={type as 'movie' | 'tv'}
						show={show}
						index={index}
						isVertical={visualIsVertical}
						rank={ranked ? index + 1 : undefined}
					/>
				</div>
			))}
		</div>
	);

	const renderCarousel = () => (
		<div className="relative">
			<div
				aria-hidden="true"
				className={cn(
					'pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-linear-to-r from-background to-transparent transition-opacity duration-(--duration-ui) motion-reduce:transition-none md:block',
					canScroll.prev ? 'opacity-100' : 'opacity-0'
				)}
			/>
			<div
				aria-hidden="true"
				className={cn(
					'pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-linear-to-l from-background to-transparent transition-opacity duration-(--duration-ui) motion-reduce:transition-none md:w-12',
					canScroll.next ? 'opacity-100' : 'opacity-0'
				)}
			/>

			<Carousel setApi={setApi} opts={carouselOpts} className="relative w-full">
				<CarouselContent className="-ml-3 cursor-grab touch-pan-y overflow-visible transform-gpu will-change-transform active:cursor-grabbing px-(--gutter) md:-ml-5">
					{validShows.map((show: Show, index: number) => (
						<CarouselItem
							key={show.id}
							className={cn('select-none pl-3 md:pl-5', carouselItemBasis)}
						>
							<div data-row-reveal-card>
								<MediaCard
									type={type as 'movie' | 'tv'}
									show={show}
									index={index}
									isVertical={visualIsVertical}
									rank={ranked ? index + 1 : undefined}
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	);

	const seeAllLink = viewAllLink && (
		// The vertical padding is cancelled by a negative margin, so the tap area
		// stays thumb sized without the link driving the heading row's height.
		<Link
			href={viewAllLink}
			prefetch={false}
			aria-label={`See all titles in ${text || 'this collection'}`}
			className="hit-target -my-2 inline-flex items-center gap-0.5 px-1 py-2 text-small font-semibold text-dim transition-colors can-hover:text-foreground"
		>
			See All
			<CaretRightIcon size={13} weight="bold" aria-hidden="true" />
		</Link>
	);

	const rowControls = !gridLayout && (
		// gap-3, not gap-2: the 48px tap boxes need clearance between them so a tap
		// on one arrow can never land on the other.
		<div className="hidden items-center gap-3 md:flex">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				shape="pill"
				data-media-row-control
				disabled={!canScroll.prev}
				onClick={() => api?.scrollPrev()}
				aria-label={`Scroll ${text || 'row'} left`}
				className="relative"
			>
				{/* A real 48px tap box around the 40px circle, as an element rather
				    than the utility's ::after, which the heading row intercepts.
				    1.25 spacing is 5px: an absolute inset resolves against the
				    padding box, and the button's 1px border eats 1px of it. */}
				<span aria-hidden="true" data-media-row-hit className="absolute -inset-1.25 z-20 block" />
				<CaretLeftIcon size={16} weight="bold" aria-hidden="true" />
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				shape="pill"
				data-media-row-control
				disabled={!canScroll.next}
				onClick={() => api?.scrollNext()}
				aria-label={`Scroll ${text || 'row'} right`}
				className="relative"
			>
				<span aria-hidden="true" data-media-row-hit className="absolute -inset-1.25 z-20 block" />
				<CaretRightIcon size={16} weight="bold" aria-hidden="true" />
			</Button>
		</div>
	);

	return (
		<section
			ref={sectionRef}
			aria-label={text || undefined}
			onKeyDownCapture={handleRowKeyDown}
			className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 section-spacing overflow-visible"
		>
			{!hideHeader && (
				// Baseline alignment, not bottom: a 1-line heading must start at the
				// same offset from the row above as a 2-line one, or the row rhythm
				// changes with heading length.
				<div className="mb-3.5 flex items-baseline gap-3 px-gutter md:mb-4">
					{rowNumber !== undefined && (
						<span
							data-row-reveal-header
							aria-hidden="true"
							className="font-mono text-caption leading-none tracking-label text-brand tabular-nums"
						>
							{String(rowNumber).padStart(2, '0')}
						</span>
					)}
					<h2
						data-row-reveal-header
						className="font-display text-display-row uppercase text-balance"
					>
						{text || ''}
					</h2>
					<span
						data-row-reveal-header
						aria-hidden="true"
						className="hidden font-mono text-caption uppercase leading-none tracking-meta-wide text-dim tabular-nums sm:block"
					>
						{validShows.length} {validShows.length === 1 ? 'title' : 'titles'}
					</span>
					{(seeAllLink || headerAction || rowControls) && (
						<div
							data-row-reveal-header
							className="ml-auto flex shrink-0 items-center gap-2 md:gap-3"
						>
							{seeAllLink}
							{headerAction}
							{rowControls}
						</div>
					)}
				</div>
			)}
			{gridLayout ? renderGrid() : renderCarousel()}
		</section>
	);
}

export default memo(MediaRowComponent);
MediaRowComponent.displayName = 'MediaRow';
