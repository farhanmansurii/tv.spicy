'use client';

import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface MediaLoaderProps {
	layout?: 'carousel' | 'grid';
	withHeader?: boolean;
	withHeaderAction?: boolean;
	isVertical?: boolean;
	ranked?: boolean;
	itemCount?: number;
	className?: string;
}

export function MediaLoader({
	layout = 'carousel',
	withHeader = false,
	withHeaderAction = false,
	isVertical = false,
	ranked = false,
	itemCount,
	className,
}: MediaLoaderProps) {
	const effectiveIsVertical = isVertical ?? false;
	const visualIsVertical = effectiveIsVertical || ranked;
	const resolvedCount = itemCount ?? (layout === 'grid' ? 12 : 8);

	return (
		<div className={cn('w-full py-3 md:py-5 group/row overflow-visible', className)}>
			{withHeader && (
				<div className="flex items-end justify-between px-1 mb-3 md:mb-4">
					<Skeleton className="h-4 w-40 md:h-5 md:w-56 rounded-ui" />
					{withHeaderAction && <Skeleton className="h-7 w-20 rounded-lg" />}
				</div>
			)}

			{layout === 'grid' ? (
				<div
					className={cn(
						'grid gap-4 md:gap-6',
						visualIsVertical
							? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
							: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
					)}
				>
					{Array.from({ length: resolvedCount }).map((_, index) => (
						<div
							key={index}
							className="flex flex-col gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
						>
							<Skeleton
								className={cn(
									'relative w-full overflow-hidden rounded-lg md:rounded-xl',
									visualIsVertical ? 'aspect-[2/3]' : 'aspect-video'
								)}
							/>
							<div className="flex flex-col gap-0.5 px-1">
								<Skeleton className="h-4 w-3/4 rounded-sm" />
								<div className="flex items-center gap-2">
									<Skeleton className="h-3.5 w-12 rounded-sm" />
									<Skeleton className="h-1.5 w-1.5 rounded-full" />
									<Skeleton className="h-3.5 w-10 rounded-sm" />
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<Carousel
					opts={{
						align: 'start',
						dragFree: true,
						containScroll: 'trimSnaps',
					}}
					className="w-full relative"
				>
					<CarouselContent className="-ml-3 cursor-grab touch-pan-y overflow-visible transform-gpu will-change-transform active:cursor-grabbing md:-ml-5">
						{Array.from({ length: resolvedCount }).map((_, index) => (
							<CarouselItem
								key={index}
								className={cn(
									'pl-3 md:pl-5 select-none',
									ranked
										? 'basis-[40%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
										: effectiveIsVertical
											? 'basis-[40%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
											: 'basis-[70%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
								)}
							>
								<div className="flex w-full flex-col gap-3">
									<div className="relative">
										{ranked && (
											<Skeleton className="absolute left-2 top-2 z-10 h-8 w-10 rounded-full opacity-70" />
										)}
										<Skeleton
											className={cn(
												'relative w-full overflow-hidden rounded-lg md:rounded-xl',
												visualIsVertical ? 'aspect-[2/3]' : 'aspect-video'
											)}
										/>
									</div>
									<div className="flex flex-col gap-0.5 px-1">
										<Skeleton className="h-4 w-3/4 rounded-sm" />
										<div className="flex items-center gap-2">
											<Skeleton className="h-3.5 w-12 rounded-sm" />
											<Skeleton className="h-1.5 w-1.5 rounded-full" />
											<Skeleton className="h-3.5 w-10 rounded-sm" />
										</div>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			)}
		</div>
	);
}
