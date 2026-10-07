'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useTVShowStore from '@/store/recentsStore';
import {
	TrashIcon,
	ClockCounterClockwiseIcon,
	CaretLeftIcon,
	CaretRightIcon,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { ContinueWatchingCard } from './continue-watching-card';
import { ReelEmptyState } from './reel-empty-state';
import { DestructiveConfirm } from './destructive-confirm';
import type { ContinueWatchingItem } from '@/lib/continue-watching';
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
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function clearRecentlyWatched() {
		setConfirmOpen(false);
		const snapshot: ContinueWatchingItem[] = [...recentlyWatched];
		if (snapshot.length === 0) return;

		const ok = await useTVShowStore.getState().deleteRecentlyWatched();
		if (!ok) return;

		toast('History cleared', {
			description: 'Your continue watching history was removed.',
			duration: 8000,
			action: {
				label: 'Undo',
				onClick: () => {
					void useTVShowStore.getState().restoreRecentlyWatched(snapshot);
				},
			},
		});
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
			<ReelEmptyState
				icon={<ClockCounterClockwiseIcon size={24} />}
				title="The reel starts here."
				caption="Start a film or series, and your progress will be waiting here."
			/>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Subtle clear action */}
			<div className="flex items-center justify-end">
				<button
					onClick={() => setConfirmOpen(true)}
					className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-mono text-micro font-medium uppercase tracking-meta text-muted-foreground transition-colors duration-(--duration-ui) can-hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<TrashIcon size={13} />
					<span className="hidden sm:inline">Clear History</span>
				</button>
			</div>

			<DestructiveConfirm
				open={confirmOpen}
				title="Clear continue watching?"
				description={`This removes all ${recentlyWatched.length} items from your history on this device and every signed-in device. You can undo right after.`}
				confirmLabel="Clear all"
				onConfirm={() => void clearRecentlyWatched()}
				onCancel={() => setConfirmOpen(false)}
			/>

			{/* Carousel */}
			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					containScroll: 'trimSnaps',
				}}
				className="w-full relative group/row -my-1"
			>
				<CarouselContent
					viewportClassName="py-1"
					className="-ml-4 md:-ml-6 overflow-visible cursor-grab active:cursor-grabbing"
				>
					{episodes.map((item, index: number) => (
						<CarouselItem
							key={item.id}
							className="pl-4 md:pl-6 basis-9/10 sm:basis-7/12 lg:basis-5/12 xl:basis-1/3"
						>
							<ContinueWatchingCard item={item} index={index} />
						</CarouselItem>
					))}
				</CarouselContent>

				<div className="flex items-center justify-between mt-4 md:mt-6 px-1">
					<div className="flex items-center gap-1 opacity-100 group-can-hover/row:opacity-100 transition-opacity duration-(--duration-ui)">
						<CarouselPrevious
							variant="glass"
							size="icon-lg"
							className="static translate-y-0 min-h-11 min-w-11"
							icon={<CaretLeftIcon size={16} />}
						/>
						<CarouselNext
							variant="glass"
							size="icon-lg"
							className="static translate-y-0 min-h-11 min-w-11"
							icon={<CaretRightIcon size={16} />}
						/>
					</div>
				</div>
			</Carousel>
		</div>
	);
}
