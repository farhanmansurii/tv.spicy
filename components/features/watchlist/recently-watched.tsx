'use client';
import useTVShowStore from '@/store/recentsStore';
import React, { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { TrashIcon } from '@phosphor-icons/react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { toast } from 'sonner';
import { ContinueWatchingCard } from './continue-watching-card';
import { DestructiveConfirm } from './destructive-confirm';
import type { ContinueWatchingItem } from '@/lib/continue-watching';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const RecentlyWatchedComponent = () => {
	const hasMounted = useHasMounted();
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const clearRecentlyWatched = useCallback(async () => {
		setConfirmOpen(false);
		const snapshot: ContinueWatchingItem[] = [...recentlyWatched];
		if (snapshot.length === 0) return;

		const store = useTVShowStore.getState();
		const ok = await store.deleteRecentlyWatched();
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
	}, [recentlyWatched]);

	const episodes = useMemo(() => {
		if (!hasMounted || recentlyWatched.length === 0) return [];
		return recentlyWatched;
	}, [hasMounted, recentlyWatched]);

	if (!hasMounted) {
		return null;
	}

	if (episodes.length === 0) return null;

	return (
		<section
			aria-label="Continue watching"
			className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 section-spacing overflow-visible"
		>
			<div className="mb-3.5 flex items-baseline gap-3 px-gutter md:mb-4">
				<h2 className="text-title text-balance text-foreground">
					Continue Watching
				</h2>
				<span
					aria-hidden="true"
					className="hidden font-mono text-caption uppercase leading-none tracking-meta-wide text-dim tabular-nums sm:block"
				>
					{episodes.length} {episodes.length === 1 ? 'title' : 'titles'}
				</span>
				<button
					type="button"
					onClick={() => setConfirmOpen(true)}
					aria-label="Clear continue watching"
					className="hit-target -my-2 ml-auto inline-flex shrink-0 items-center gap-1.5 px-1 py-2 text-small font-semibold text-dim transition-colors duration-(--duration-ui) can-hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<TrashIcon size={14} aria-hidden="true" />
					Clear
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

			<Carousel
				opts={{ align: 'start', dragFree: true, containScroll: 'trimSnaps' }}
				className="relative w-full"
			>
				<CarouselContent className="-ml-3 cursor-grab touch-pan-y overflow-visible active:cursor-grabbing px-(--gutter) md:-ml-5">
					{episodes.map((item, index: number) => (
						<CarouselItem
							key={item.id}
							className="select-none pl-3 md:pl-5 basis-7/10 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
						>
							<ContinueWatchingCard item={item} index={index} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</section>
	);
};

export default memo(RecentlyWatchedComponent);
