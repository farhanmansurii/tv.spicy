'use client';
import useTVShowStore from '@/store/recentsStore';
import React, { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContinueWatchingCard } from './continue-watching-card';
import CommonTitle from '@/components/shared/animated/common-title';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

const RecentlyWatchedComponent = () => {
	const hasMounted = useHasMounted();
	const { recentlyWatched, initialize, isLoading: storeIsLoading } = useTVShowStore();
	const [isBootstrapping, setIsBootstrapping] = useState(true);

	const loadData = useCallback(async () => {
		if (!hasMounted) return;

		try {
			await initialize();
		} catch (error) {
			console.error('Error loading continue watching:', error);
		} finally {
			setIsBootstrapping(false);
		}
	}, [hasMounted, initialize]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const clearRecentlyWatched = useCallback(() => {
		const store = useTVShowStore.getState();
		store.deleteRecentlyWatched();
	}, []);

	const episodes = useMemo(() => {
		if (!hasMounted || recentlyWatched.length === 0) return [];
		return recentlyWatched;
	}, [hasMounted, recentlyWatched]);

	// Show skeleton while loading
	if (!hasMounted || storeIsLoading || isBootstrapping) {
		return <MediaLoader withHeader withHeaderAction className="min-h-[280px]" />;
	}

	// Only return null after loading is complete
	if (episodes.length === 0) return null;

	return (
		<div className="w-full py-4 group/row">
			{/* Header */}
			<div className="flex items-center justify-between px-1 mb-3">
				<CommonTitle
					text="Continue Watching"
					variant="small"
					as="h2"
					spacing="none"
					className="text-lg md:text-xl font-semibold text-white/90"
				/>
				<Button
					variant="ghost"
					size="sm"
					onClick={clearRecentlyWatched}
					className="text-zinc-600 hover:text-red-400 transition-colors gap-2 text-xs"
				>
					<Trash2 className="w-3.5 h-3.5" />
					<span className="hidden sm:inline">Clear</span>
				</Button>
			</div>

			{/* Scrollable Carousel — compact horizontal cards */}
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

				<div className="flex items-center gap-1 mt-3 px-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300">
					<CarouselPrevious
						className="static translate-y-0 h-7 w-7 bg-white/[0.06] border-white/10 text-zinc-400 hover:bg-white hover:text-black transition-all rounded-full"
						icon={<ChevronLeft className="h-3.5 w-3.5" />}
					/>
					<CarouselNext
						className="static translate-y-0 h-7 w-7 bg-white/[0.06] border-white/10 text-zinc-400 hover:bg-white hover:text-black transition-all rounded-full"
						icon={<ChevronRight className="h-3.5 w-3.5" />}
					/>
				</div>
			</Carousel>
		</div>
	);
};

export default memo(RecentlyWatchedComponent);
