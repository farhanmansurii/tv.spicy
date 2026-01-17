/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import gsap from 'gsap';
import {
	GalleryVerticalEnd,
	Grid,
	List,
	Sparkles,
	LayoutDashboard,
	Loader2,
	AlertCircle,
} from 'lucide-react';
import {
	SelectTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { fetchSeasonEpisodes } from '@/lib/api';
import { useEpisodeStore } from '@/store/episodeStore';
import { useEpisodeViewStore } from '@/store/episodeViewStore';
import { usePlayerPrefsStore } from '@/store/playerPrefsStore';
import useTVShowStore from '@/store/recentsStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import { cn } from '@/lib/utils';
import SegmentedControl from '@/components/shared/segmented-control';
import { EpisodeCard } from '../card/episode-card';
import { EpisodeListRow } from '../card/episode-list-card';

const SeasonTabs = ({ seasons, showId, showData }: any) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const { view, setView } = useEpisodeViewStore();
	const { activeEP, setActiveEP, setIsPlayerSticky } = useEpisodeStore();
	const { stickyEnabled, setStickyEnabled } = usePlayerPrefsStore();
	const [listDensity, setListDensity] = useState<'comfortable' | 'compact'>('comfortable');
	const hasActiveEpisode = !!activeEP;
	const { addRecentlyWatched } = useTVShowStore();
	const playerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const stickyRef = useRef<HTMLDivElement>(null);
	const [isStickyDismissed, setIsStickyDismissed] = useState(false);
	const [isPortrait, setIsPortrait] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile device and portrait orientation
	useEffect(() => {
		const checkMobileAndOrientation = () => {
			const mobile = window.innerWidth < 768;
			const portrait = window.matchMedia('(orientation: portrait)').matches;
			setIsMobile(mobile);
			setIsPortrait(portrait);
		};

		checkMobileAndOrientation();

		const orientationQuery = window.matchMedia('(orientation: portrait)');
		const handleOrientationChange = (e: MediaQueryListEvent) => {
			setIsPortrait(e.matches);
		};

		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		orientationQuery.addEventListener('change', handleOrientationChange);
		window.addEventListener('resize', handleResize);

		return () => {
			orientationQuery.removeEventListener('change', handleOrientationChange);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	const { ref: stickySentinelRef, inView: stickySentinelInView } = useInView({
		threshold: 0,
		rootMargin: '-72px 0px 0px 0px',
	});
	// Sticky only on mobile phones in portrait orientation
	const isSticky =
		hasActiveEpisode && stickyEnabled && !stickySentinelInView && isMobile && isPortrait;

	// Sync sticky state to store so header can react
	useEffect(() => {
		setIsPlayerSticky(isSticky && !isStickyDismissed);
	}, [isSticky, isStickyDismissed, setIsPlayerSticky]);

	// 1. STABLE STATE LOGIC
	const validSeasons = useMemo(
		() => seasons?.filter((s: any) => s.season_number > 0) || seasons || [],
		[seasons]
	);
	const [activeSeason, setActiveSeason] = useState<number | null>(null);

	// 2. DATA SYNC
	const {
		data: seasonData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['episodes', showId, activeSeason],
		queryFn: () => fetchSeasonEpisodes(showId, activeSeason as number),
		enabled: !!showId && activeSeason !== null,
	});

	const episodes = seasonData?.episodes;

	// 3. HYDRATION & INITIALIZATION
	useEffect(() => {
		const sParam = searchParams.get('season');
		const eParam = searchParams.get('episode');

		if (sParam) {
			setActiveSeason(parseInt(sParam));
		} else if (validSeasons.length > 0) {
			setActiveSeason(validSeasons[0].season_number);
		}
	}, [validSeasons, searchParams]);

	// Initialize active episode from URL params when episodes are loaded
	useEffect(() => {
		const sParam = searchParams.get('season');
		const eParam = searchParams.get('episode');

		if (episodes && eParam && sParam && parseInt(sParam) === activeSeason) {
			const episode = episodes.find(
				(ep: any) =>
					ep.season_number === parseInt(sParam) && ep.episode_number === parseInt(eParam)
			);
			if (episode && activeEP?.id !== episode.id) {
				// Ensure tv_id and show_name are set for cross-show validation and recently watched
				const enrichedEpisode = {
					...episode,
					tv_id: String(showId),
					show_name: showData?.name || showData?.title || '',
				};
				setActiveEP(enrichedEpisode);

				// Add to recently watched for Continue Watching functionality
				addRecentlyWatched(enrichedEpisode);
			}
		}
	}, [
		episodes,
		searchParams,
		activeSeason,
		activeEP,
		setActiveEP,
		addRecentlyWatched,
		showId,
		showData,
	]);

	// 4. ACTION HANDLERS (Functional Fixes)
	const handleSeasonChange = (value: string) => {
		const sNum = Number(value);
		setActiveSeason(sNum);
		const params = new URLSearchParams(searchParams.toString());
		params.set('season', value);
		params.delete('episode'); // Clean episode state on season change
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const onEpisodeClick = useCallback(
		(episode: any, event?: React.MouseEvent) => {
			// Immediate visual feedback
			if (event?.currentTarget) {
				const target = event.currentTarget as HTMLElement;
				target.style.transform = 'scale(0.98)';
				setTimeout(() => {
					target.style.transform = '';
				}, 150);
			}

			// Ensure tv_id is set for cross-show validation (tv_id should be string for consistency)
			const enrichedEpisode = {
				...episode,
				tv_id: String(showId),
				show_name: showData?.name || showData?.title || '',
			};
			setActiveEP(enrichedEpisode);

			// Add to recently watched for Continue Watching functionality
			addRecentlyWatched(enrichedEpisode);

			const params = new URLSearchParams(searchParams.toString());
			params.set('season', String(episode.season_number));
			params.set('episode', String(episode.episode_number));
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[router, pathname, searchParams, setActiveEP, addRecentlyWatched, showId, showData]
	);

	useEffect(() => {
		if (!contentRef.current || isLoading) return;
		const ctx = gsap.context(() => {
			const items = gsap.utils.toArray<HTMLElement>(
				'[data-episode-item]',
				contentRef.current
			);
			if (!items.length) return;
			gsap.fromTo(
				items,
				{ opacity: 0, y: 10, scale: 0.98 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power2.out', stagger: 0.04 }
			);
		}, contentRef);

		return () => ctx.revert();
	}, [view, activeSeason, isLoading, episodes?.length]);

	useEffect(() => {
		if (!isSticky) {
			setIsStickyDismissed(false);
			if (stickyRef.current) {
				gsap.set(stickyRef.current, { clearProps: 'opacity,transform' });
			}
			return;
		}

		if (isStickyDismissed || !stickyRef.current) return;
		gsap.fromTo(
			stickyRef.current,
			{ opacity: 0, y: -6 },
			{ opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
		);
	}, [isSticky, isStickyDismissed]);

	const handleStickyClose = useCallback(() => {
		const onComplete = () => {
			setIsStickyDismissed(true);
			toast('Sticky player hidden', {
				description: 'Turn off sticky player for this device?',
				action: {
					label: 'Disable',
					onClick: () => setStickyEnabled(false),
				},
			});
		};

		if (!stickyRef.current) {
			onComplete();
			return;
		}

		gsap.to(stickyRef.current, {
			opacity: 0,
			y: -6,
			duration: 0.18,
			ease: 'power2.in',
			onComplete,
		});
	}, [setStickyEnabled]);

	// Handle next episode navigation
	const handleNextEpisode = useCallback(() => {
		// First, try to get current episode from activeEP or URL params
		let currentEpisode = activeEP;

		if (!currentEpisode && episodes && episodes.length > 0) {
			const sParam = searchParams.get('season');
			const eParam = searchParams.get('episode');
			if (sParam && eParam) {
				currentEpisode = episodes.find(
					(ep: any) =>
						ep.season_number === parseInt(sParam) &&
						ep.episode_number === parseInt(eParam)
				);
			}
		}

		if (!currentEpisode || !episodes || episodes.length === 0) {
			return;
		}

		// TypeScript guard: currentEpisode is guaranteed to be non-null here
		const episode = currentEpisode;

		// Find current episode index
		const currentIndex = episodes.findIndex(
			(ep: any) =>
				ep.id === episode.id ||
				(ep.season_number === episode.season_number &&
					ep.episode_number === episode.episode_number)
		);

		if (currentIndex === -1) {
			return;
		}

		// Check if there's a next episode in the current season
		if (currentIndex < episodes.length - 1) {
			const nextEpisode = episodes[currentIndex + 1];
			onEpisodeClick(nextEpisode);
			return;
		}

		// If at the end of current season, try to move to next season
		const currentSeasonIndex = validSeasons.findIndex(
			(s: any) => s.season_number === activeSeason
		);

		if (currentSeasonIndex < validSeasons.length - 1) {
			const nextSeason = validSeasons[currentSeasonIndex + 1];
			const params = new URLSearchParams(searchParams.toString());
			params.set('season', String(nextSeason.season_number));
			params.set('episode', '1');
			router.push(`${pathname}?${params.toString()}`, { scroll: false });
		}
	}, [
		activeEP,
		episodes,
		activeSeason,
		validSeasons,
		router,
		pathname,
		searchParams,
		onEpisodeClick,
	]);

	if (isError)
		return (
			<div className="flex flex-col items-center py-20 gap-4 text-destructive">
				<AlertCircle className="w-8 h-8" />
				<p className="font-bold">Failed to load episodes. Please try again.</p>
			</div>
		);

	return (
		<div className="w-full flex flex-col gap-10 md:gap-16">
			{/* PLAYER COMPONENT */}
			{hasActiveEpisode && (
				<>
					<div ref={stickySentinelRef} className="h-px w-full" />
					<div
						ref={playerRef}
						data-player-container
						className={cn(
							'w-full transition-all duration-200',
							stickyEnabled && isMobile && isPortrait
								? 'sticky top-2 z-30 bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-white/5'
								: 'relative z-10',
							isSticky &&
								isStickyDismissed &&
								'opacity-0 pointer-events-none max-h-0 overflow-hidden p-0'
						)}
					>
						<div ref={stickyRef} className="relative">
							<TVContainer
								key={`${activeEP?.id}-${activeSeason}`}
								showId={showId}
								getNextEp={handleNextEpisode}
								isSticky={isSticky && !isStickyDismissed}
								onCloseSticky={handleStickyClose}
							/>
						</div>
					</div>
				</>
			)}

			{/* NAVIGATION CONTROLS */}
			<div className="space-y-4">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-4">
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<Select value={String(activeSeason)} onValueChange={handleSeasonChange}>
								<SelectTrigger className="h-10 w-40 bg-zinc-900 border-white/10 rounded-xl text-xs font-bold">
									<SelectValue placeholder="Select Season" />
								</SelectTrigger>
								<SelectContent className="bg-zinc-950 border-white/10">
									{validSeasons.map((s: any) => (
										<SelectItem
											key={s.season_number}
											value={String(s.season_number)}
										>
											Season {s.season_number}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
								{episodes?.length || 0} Episodes
							</span>
						</div>
					</div>
				</div>

				{/* View Mode Toggle - Repositioned closer to content */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
					<SegmentedControl
						value={view}
						onChange={(val) => setView(val as any)}
						items={[
							{
								value: 'list',
								icon: List,
								label: 'List',
								showLabelOnMobile: false,
								tooltip: 'Compact list with episode details',
							},
							{
								value: 'grid',
								icon: LayoutDashboard,
								label: 'Grid',
								showLabelOnMobile: false,
								tooltip: 'Visual grid with thumbnails',
							},
							{
								value: 'carousel',
								icon: GalleryVerticalEnd,
								label: 'Carousel',
								showLabelOnMobile: false,
								tooltip: 'Swipeable horizontal view',
							},
						]}
					/>
					{view === 'list' && (
						<SegmentedControl
							value={listDensity}
							onChange={(val) => setListDensity(val as 'comfortable' | 'compact')}
							items={[
								{ value: 'comfortable', label: 'Comfort' },
								{ value: 'compact', label: 'Compact' },
							]}
							className="hidden sm:inline-flex"
						/>
					)}
				</div>

				{/* CONTENT RENDERER */}
				<div
					ref={contentRef}
					className={cn(isLoading ? 'opacity-50 pointer-events-none min-h-[400px]' : '')}
				>
					{isLoading ? (
						<div className="flex items-center justify-center py-20">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
						</div>
					) : (
						<>
							{view === 'grid' && (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{episodes?.map((ep: any) => (
										<div key={ep.id} data-episode-item>
											<EpisodeCard
												episode={ep}
												active={activeEP?.id === ep.id}
												toggle={onEpisodeClick}
											/>
										</div>
									))}
								</div>
							)}
							{view === 'list' && (
								<div className="flex flex-col gap-2">
									{episodes?.map((ep: any) => (
										<div key={ep.id} data-episode-item>
											<EpisodeListRow
												episode={ep}
												active={activeEP?.id === ep.id}
												toggle={onEpisodeClick}
												density={listDensity}
											/>
										</div>
									))}
								</div>
							)}
							{view === 'carousel' && (
								<Carousel opts={{ align: 'start', dragFree: true }}>
									<CarouselContent className="-ml-2 py-2">
										{episodes?.map((ep: any) => (
											<CarouselItem
												key={ep.id}
												className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3"
											>
												<div data-episode-item>
													<EpisodeCard
														episode={ep}
														active={activeEP?.id === ep.id}
														toggle={onEpisodeClick}
													/>
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
								</Carousel>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default SeasonTabs;
