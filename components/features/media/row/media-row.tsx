'use client';

import React, { useMemo, memo } from 'react';
import Link from 'next/link';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
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
}: MediaRowProps) {
	const effectiveIsVertical = isVertical ?? false;
	const visualIsVertical = effectiveIsVertical || ranked;
	const carouselItemBasis = ranked
		? 'basis-[40%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
		: effectiveIsVertical
			? 'basis-[40%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
			: 'basis-[70%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4';

	const validShows = useMemo(() => {
		if (!shows) return [];
		if (isVertical !== undefined) {
			return shows.filter((show: Show) =>
				isVertical ? !!show.poster_path : !!show.backdrop_path
			);
		}
		return shows.filter((show: Show) => !!show.backdrop_path || !!show.poster_path);
	}, [shows, isVertical]);

	if (validShows.length === 0) return null;

	const renderGrid = () => (
		<div
			className={cn(
				'grid gap-4 md:gap-6',
				visualIsVertical
					? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
					: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
			)}
		>
			{validShows.map((show: Show, index: number) => (
				<MediaCard
					key={show.id}
					type={type as 'movie' | 'tv'}
					show={show}
					index={index}
					isVertical={visualIsVertical}
					rank={ranked ? index + 1 : undefined}
				/>
			))}
		</div>
	);

	const renderCarousel = () => (
		<div className="group/row relative">
			{/* Left edge gradient fade */}
			<div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-10 bg-gradient-to-r from-background to-transparent opacity-0 transition-opacity duration-300 group-hover/row:opacity-100 motion-reduce:transition-none md:block" />
			{/* Right edge gradient fade */}
			<div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-7 bg-gradient-to-l from-background to-transparent md:w-12" />

			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					containScroll: 'trimSnaps',
				}}
				className="relative w-full"
			>
				<CarouselContent className="-ml-3 cursor-grab touch-pan-y overflow-visible transform-gpu will-change-transform active:cursor-grabbing md:-ml-5">
					{validShows.map((show: Show, index: number) => (
						<CarouselItem
							key={show.id}
							className={cn('select-none pl-3 md:pl-5', carouselItemBasis)}
						>
							<MediaCard
								type={type as 'movie' | 'tv'}
								show={show}
								index={index}
								isVertical={visualIsVertical}
								rank={ranked ? index + 1 : undefined}
							/>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Keep controls discoverable on touch and visible when reached by keyboard. */}
				<div className="absolute -left-1 top-1/2 z-20 hidden -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 group-focus-within/row:opacity-100 motion-reduce:transition-none md:block">
					<CarouselPrevious
						data-media-row-control
						className="static h-11 w-11 translate-y-0 border-white/10 bg-black/68 text-white backdrop-blur-xl transition-colors hover:bg-white hover:text-black"
						icon={<CaretLeftIcon size={16} weight="bold" />}
					/>
				</div>
				<div className="absolute -right-1 top-1/2 z-20 hidden -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 group-focus-within/row:opacity-100 motion-reduce:transition-none md:block">
					<CarouselNext
						data-media-row-control
						className="static h-11 w-11 translate-y-0 border-white/10 bg-black/68 text-white backdrop-blur-xl transition-colors hover:bg-white hover:text-black"
						icon={<CaretRightIcon size={16} weight="bold" />}
					/>
				</div>
			</Carousel>
		</div>
	);

	return (
		<div
			className={cn(
				'group/row w-full overflow-visible',
				hideHeader ? 'py-0' : 'py-3 md:py-5'
			)}
		>
			{!hideHeader && (
				<div className="mb-3 flex items-center justify-between gap-4 px-1 md:mb-4">
					<h2 className="cursor-default text-lg font-bold tracking-[-0.02em] text-white md:text-xl">
						{text || ''}
					</h2>
					<div className="flex shrink-0 items-center gap-3">
						{viewAllLink && (
							<Link
								href={viewAllLink}
								aria-label={`See all titles in ${text || 'this collection'}`}
								className="inline-flex min-h-11 items-center gap-0.5 px-1 text-[13px] font-semibold text-white/48 transition-colors hover:text-white focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/70"
							>
								See All
								<CaretRightIcon size={13} weight="bold" aria-hidden="true" />
							</Link>
						)}
						{headerAction && <div className="flex items-center">{headerAction}</div>}
					</div>
				</div>
			)}
			{gridLayout ? renderGrid() : renderCarousel()}
		</div>
	);
}

export default memo(MediaRowComponent);
MediaRowComponent.displayName = 'MediaRow';
