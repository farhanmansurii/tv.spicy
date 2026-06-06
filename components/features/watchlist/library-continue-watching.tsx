'use client';

import { useMemo } from 'react';
import useTVShowStore from '@/store/recentsStore';
import {
	TrashIcon,
	ClockCounterClockwiseIcon,
	CaretLeftIcon,
	CaretRightIcon,
} from '@phosphor-icons/react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContinueWatchingCard } from './continue-watching-card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

export function LibraryContinueWatching() {
	const hasMounted = useHasMounted();
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);

	function clearRecentlyWatched() {
		const store = useTVShowStore.getState();
		store.deleteRecentlyWatched();
	}

	const episodes = useMemo(() => {
		if (!hasMounted || recentlyWatched.length === 0) return [];
		return recentlyWatched;
	}, [hasMounted, recentlyWatched]);

	if (!hasMounted) {
		return null;
	}

	if (episodes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 space-y-4">
				<div className="w-16 h-16 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] flex items-center justify-center">
					<ClockCounterClockwiseIcon size={28} className="text-muted-foreground/50" />
				</div>
				<h3 className="text-lg font-semibold text-foreground">No recent activity</h3>
				<p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
					Start watching shows and movies to see them here. Your progress will be saved
					automatically.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Subtle clear action */}
			<div className="flex items-center justify-end">
				<button
					onClick={clearRecentlyWatched}
					className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60 hover:text-red-400 transition-colors duration-200"
				>
					<TrashIcon size={13} />
					<span className="hidden sm:inline">Clear History</span>
				</button>
			</div>

			{/* Carousel */}
			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					containScroll: 'trimSnaps',
				}}
				className="w-full relative group/row"
			>
				<CarouselContent className="-ml-4 md:-ml-6 overflow-visible cursor-grab active:cursor-grabbing">
					{episodes.map((item, index: number) => (
						<CarouselItem
							key={item.id}
							className="pl-4 md:pl-6 basis-[90%] sm:basis-[58%] lg:basis-[42%] xl:basis-[34%]"
						>
							<ContinueWatchingCard item={item} index={index} />
						</CarouselItem>
					))}
				</CarouselContent>

				<div className="flex items-center justify-between mt-4 md:mt-6 px-1">
					<div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500">
						<CarouselPrevious
							className="static translate-y-0 h-8 w-8 bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white hover:text-black transition-all"
							icon={<CaretLeftIcon size={16} />}
						/>
						<CarouselNext
							className="static translate-y-0 h-8 w-8 bg-zinc-900 border-white/5 text-zinc-500 hover:bg-white hover:text-black transition-all"
							icon={<CaretRightIcon size={16} />}
						/>
					</div>
				</div>
			</Carousel>
		</div>
	);
}
