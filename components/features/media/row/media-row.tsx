'use client';

import React, { useMemo, memo } from 'react';
import Link from 'next/link';
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
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
				effectiveIsVertical
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
					isVertical={effectiveIsVertical}
					rank={ranked ? index + 1 : undefined}
				/>
			))}
		</div>
	);

	const renderCarousel = () => (
		<div className="relative group/row">
			{/* Left edge gradient fade */}
			<div className="absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-500" />
			{/* Right edge gradient fade */}
			<div className="absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					containScroll: 'trimSnaps',
				}}
				className="w-full relative"
			>
				<CarouselContent className="-ml-3 md:-ml-5 overflow-visible cursor-grab active:cursor-grabbing">
					{validShows.map((show: Show, index: number) => (
						<CarouselItem
							key={show.id}
							className={cn(
								'pl-3 md:pl-5 select-none',
								!effectiveIsVertical
									? 'basis-[82%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
									: 'basis-[42%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
							)}
						>
							<MediaCard
								type={type as 'movie' | 'tv'}
								show={show}
								index={index}
								isVertical={effectiveIsVertical}
								rank={ranked ? index + 1 : undefined}
							/>
						</CarouselItem>
					))}

					{viewAllLink && (
						<CarouselItem
							className={cn(
								'pl-3 md:pl-5 select-none',
								!effectiveIsVertical
									? 'basis-[82%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
									: 'basis-[42%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
							)}
						>
							<Link
								href={viewAllLink}
								aria-label={`View all titles in ${text || 'this collection'}`}
								className="block h-full group/all"
							>
								<div className="relative aspect-video md:h-full w-full flex items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
									<div className="flex flex-col items-center gap-2">
										<PlusIcon size={18} weight="bold" className="text-zinc-500 group-hover/all:text-zinc-300 transition-colors" />
										<span className="text-xs font-medium text-zinc-500 group-hover/all:text-zinc-300 transition-colors">
											View All
										</span>
									</div>
								</div>
							</Link>
						</CarouselItem>
					)}
				</CarouselContent>

				{/* Hover-peek navigation arrows */}
				<div className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500">
					<CarouselPrevious
						className="static translate-y-0 h-9 w-9 bg-black/60 border-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
						icon={<CaretLeftIcon size={16} weight="bold" />}
					/>
				</div>
				<div className="absolute -right-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500">
					<CarouselNext
						className="static translate-y-0 h-9 w-9 bg-black/60 border-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md"
						icon={<CaretRightIcon size={16} weight="bold" />}
					/>
				</div>
			</Carousel>
		</div>
	);

	return (
		<div className="w-full py-3 md:py-5 group/row overflow-visible">
			{!hideHeader && (
				<div className="flex items-end justify-between px-1 mb-3 md:mb-4">
					{/* Apple TV-style section header: small, uppercase, wide tracking */}
					<h2 className="text-xs md:text-sm font-bold text-white/70 uppercase tracking-[0.12em] hover:text-white transition-colors duration-300 cursor-default">
						{text || ''}
					</h2>
					{headerAction && <div className="flex items-center">{headerAction}</div>}
				</div>
			)}
			{gridLayout ? renderGrid() : renderCarousel()}
		</div>
	);
}

export default memo(MediaRowComponent);
MediaRowComponent.displayName = 'MediaRow';
