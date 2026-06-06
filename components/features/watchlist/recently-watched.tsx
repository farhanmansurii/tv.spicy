'use client';
import useTVShowStore from '@/store/recentsStore';
import React, { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContinueWatchingCard } from './continue-watching-card';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

const RecentlyWatchedComponent = () => {
	const hasMounted = useHasMounted();
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);

	const clearRecentlyWatched = useCallback(() => {
		const store = useTVShowStore.getState();
		store.deleteRecentlyWatched();
	}, []);

	const episodes = useMemo(() => {
		if (!hasMounted || recentlyWatched.length === 0) return [];
		return recentlyWatched;
	}, [hasMounted, recentlyWatched]);

	if (!hasMounted) {
		return null;
	}

	if (episodes.length === 0) return null;

	return (
		<div className="w-full py-3 md:py-5 group/row">
			{/* Header — Apple TV style: small, uppercase, wide tracking */}
			<div className="flex items-end justify-between px-1 mb-3 md:mb-4">
				<h2 className="text-xs md:text-sm font-bold text-white/70 uppercase tracking-[0.12em] hover:text-white transition-colors duration-300 cursor-default">
					Continue Watching
				</h2>
				<Button
					variant="ghost"
					size="sm"
					onClick={clearRecentlyWatched}
					className="text-zinc-600 hover:text-red-400 transition-colors gap-2 text-xs"
				>
					<TrashIcon size={14} />
					<span className="hidden sm:inline">Clear</span>
				</Button>
			</div>

			{/* Scrollable Carousel — compact horizontal cards */}
			<div className="relative group/carousel">
				{/* Edge gradients */}
				<div className="absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500" />
				<div className="absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

				<Carousel
					opts={{
						align: 'start',
						dragFree: true,
						containScroll: 'trimSnaps',
					}}
					className="w-full relative"
				>
					<CarouselContent className="-ml-3 cursor-grab active:cursor-grabbing">
						{episodes.map((item, index: number) => (
							<CarouselItem
								key={item.id}
								className="pl-3 basis-[96%] sm:basis-[52%] lg:basis-[38%] xl:basis-[30%]"
							>
								<ContinueWatchingCard item={item} index={index} />
							</CarouselItem>
						))}
					</CarouselContent>

					{/* Hover-peek arrows */}
					<div className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500">
						<CarouselPrevious
							className="static translate-y-0 h-8 w-8 bg-black/60 border-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md rounded-full"
							icon={<CaretLeftIcon size={16} weight="bold" />}
						/>
					</div>
					<div className="absolute -right-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500">
						<CarouselNext
							className="static translate-y-0 h-8 w-8 bg-black/60 border-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md rounded-full"
							icon={<CaretRightIcon size={16} weight="bold" />}
						/>
					</div>
				</Carousel>
			</div>
		</div>
	);
};

export default memo(RecentlyWatchedComponent);
