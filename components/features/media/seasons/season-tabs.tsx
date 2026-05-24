'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useHaptics } from '@/hooks/use-haptics';
import { motion } from 'framer-motion';
import { SquaresFourIcon, ListBulletsIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { fetchSeasonEpisodes } from '@/lib/api';
import { useEpisodeStore } from '@/store/episodeStore';
import { usePlayerPrefsStore } from '@/store/playerPrefsStore';
import useTVShowStore from '@/store/recentsStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import { cn } from '@/lib/utils';
import type { Episode as EpisodeType, SeasonTabsProps } from '@/lib/types';
import type { TMDBEpisode, TMDBSeasonDetails } from '@/lib/types/tmdb';
import { SeasonSelector } from './season-selector';
import { EpisodeStrip, type EpisodeViewMode } from './episode-strip';
import { EpisodeDetailPanel } from './episode-detail-panel';

const SeasonTabs = ({ seasons, showId, showData }: SeasonTabsProps) => {
	const haptic = useHaptics();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const hydrateEpisode = useCallback(
		(episode: TMDBEpisode): EpisodeType => ({
			...episode,
			show_id: showData?.id,
			tv_id: String(showId),
			show_name: showData?.name || showData?.title || '',
			production_code: '',
			air_date: episode.air_date ?? '',
			overview: episode.overview ?? '',
			runtime: episode.runtime ?? 0,
			still_path: episode.still_path ?? null,
			crew: episode.crew ?? [],
			guest_stars: episode.guest_stars ?? [],
		}),
		[showData, showId]
	);

	const { activeEP, setActiveEP, setIsPlayerSticky } = useEpisodeStore();
	const { stickyEnabled, setStickyEnabled } = usePlayerPrefsStore();
	const activeEpisodeForShow =
		activeEP && String(activeEP.tv_id) === String(showId) ? activeEP : null;
	const hasActiveEpisode = !!activeEpisodeForShow;
	const { addRecentlyWatched } = useTVShowStore();

	const playerRef = useRef<HTMLDivElement>(null);
	const [isStickyDismissed, setIsStickyDismissed] = useState(false);
	const [isPortrait, setIsPortrait] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile + orientation
	useEffect(() => {
		const check = () => {
			setIsMobile(window.innerWidth < 768);
			setIsPortrait(window.matchMedia('(orientation: portrait)').matches);
		};
		const handleOrientationChange = (event: MediaQueryListEvent) => {
			setIsPortrait(event.matches);
		};

		check();
		const mq = window.matchMedia('(orientation: portrait)');
		mq.addEventListener('change', handleOrientationChange);
		window.addEventListener('resize', check, { passive: true });
		return () => {
			mq.removeEventListener('change', handleOrientationChange);
			window.removeEventListener('resize', check);
		};
	}, []);

	const { ref: stickySentinelRef, inView: stickySentinelInView } = useInView({
		threshold: 0,
		rootMargin: '-72px 0px 0px 0px',
	});
	const isSticky =
		hasActiveEpisode && stickyEnabled && !stickySentinelInView && isMobile && isPortrait;

	useEffect(() => {
		setIsPlayerSticky(isSticky && !isStickyDismissed);
	}, [isSticky, isStickyDismissed, setIsPlayerSticky]);

	// State
	const validSeasons = useMemo(
		() => seasons?.filter((s) => s.season_number > 0) || seasons || [],
		[seasons]
	);
	const [activeSeason, setActiveSeason] = useState<number | null>(null);
	const [viewMode, setViewMode] = useState<EpisodeViewMode>('grid');

	// Data
	const { data: seasonData, isFetching, isError } = useQuery<TMDBSeasonDetails>({
		queryKey: ['episodes', showId, activeSeason],
		queryFn: () => fetchSeasonEpisodes(showId, activeSeason as number),
		enabled: !!showId && activeSeason !== null,
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
	});

	const episodes = useMemo(
		() => seasonData?.episodes?.map(hydrateEpisode) || [],
		[seasonData, hydrateEpisode]
	);

	// Init from URL
	useEffect(() => {
		const sParam = searchParams.get('season');
		if (sParam) {
			setActiveSeason(parseInt(sParam));
		} else if (validSeasons.length > 0) {
			setActiveSeason(validSeasons[0].season_number);
		}
	}, [validSeasons, searchParams]);

	// Init active episode from URL when episodes loaded
	useEffect(() => {
		const sParam = searchParams.get('season');
		const eParam = searchParams.get('episode');
		if (episodes.length && eParam && sParam && parseInt(sParam) === activeSeason) {
			const ep = episodes.find(
				(ep) =>
					ep.season_number === parseInt(sParam) && ep.episode_number === parseInt(eParam)
			);
			if (ep && activeEP?.id !== ep.id) {
				setActiveEP(ep);
				addRecentlyWatched(ep);
			}
		}
	}, [episodes, searchParams, activeSeason, activeEP, setActiveEP, addRecentlyWatched]);

	const handleSeasonChange = useCallback(
		(sNum: number) => {
			haptic('selection');
			setActiveSeason(sNum);
			const params = new URLSearchParams(searchParams.toString());
			params.set('season', String(sNum));
			params.delete('episode');
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[haptic, router, pathname, searchParams]
	);

	const onEpisodeClick = useCallback(
		(episode: EpisodeType, _event?: React.MouseEvent) => {
			setActiveEP(episode);
			addRecentlyWatched(episode);
			const params = new URLSearchParams(searchParams.toString());
			params.set('season', String(episode.season_number));
			params.set('episode', String(episode.episode_number));
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		},
		[router, pathname, searchParams, setActiveEP, addRecentlyWatched]
	);

	const handleStickyClose = useCallback(() => {
		setIsStickyDismissed(true);
		toast('Sticky player hidden', {
			description: 'Turn off sticky player for this device?',
			action: {
				label: 'Disable',
				onClick: () => setStickyEnabled(false),
			},
		});
	}, [setStickyEnabled]);

	// Next episode
	const handleNextEpisode = useCallback(() => {
		let current = activeEP;
		if (!current && episodes.length > 0) {
			const sParam = searchParams.get('season');
			const eParam = searchParams.get('episode');
			if (sParam && eParam) {
				const found = episodes.find(
					(ep) =>
						ep.season_number === parseInt(sParam) &&
						ep.episode_number === parseInt(eParam)
				);
				if (found) current = found;
			}
		}
		if (!current || !episodes.length) return;
		const idx = episodes.findIndex(
			(ep) =>
				ep.id === current!.id ||
				(ep.season_number === current!.season_number &&
					ep.episode_number === current!.episode_number)
		);
		if (idx === -1) return;
		if (idx < episodes.length - 1) {
			onEpisodeClick(episodes[idx + 1]);
			return;
		}
		const sIdx = validSeasons.findIndex((s) => s.season_number === activeSeason);
		if (sIdx < validSeasons.length - 1) {
			const nextSeason = validSeasons[sIdx + 1];
			const params = new URLSearchParams(searchParams.toString());
			params.set('season', String(nextSeason.season_number));
			params.set('episode', '1');
			router.push(`${pathname}?${params.toString()}`, { scroll: false });
		}
	}, [activeEP, episodes, activeSeason, validSeasons, router, pathname, searchParams, onEpisodeClick]);

	if (isError)
		return (
			<div className="flex flex-col items-center py-20 gap-4 text-destructive">
				<WarningCircleIcon size={32} weight="fill" />
				<p className="font-bold">Failed to load episodes. Please try again.</p>
			</div>
		);

	return (
		<div className="w-full flex flex-col gap-6 md:gap-10">
			{/* PLAYER */}
			{hasActiveEpisode && (
				<>
					<div ref={stickySentinelRef} className="h-px w-full" />
					<div
						ref={playerRef}
						data-player-container
						className={cn(
							'w-full',
							stickyEnabled && isMobile && isPortrait
								? 'sticky top-2 z-30'
								: 'relative z-10',
							isSticky && isStickyDismissed && 'opacity-0 pointer-events-none max-h-0 overflow-hidden p-0'
						)}
					>
						<TVContainer
							showId={showId}
							getNextEp={handleNextEpisode}
							isSticky={isSticky && !isStickyDismissed}
							onCloseSticky={handleStickyClose}
						/>
					</div>
				</>
			)}

			{/* SEASON SELECTOR + EPISODES */}
			<div className="space-y-4 md:space-y-5">
				{/* Episode detail panel */}
				{activeEpisodeForShow && (
					<EpisodeDetailPanel episode={activeEpisodeForShow} />
				)}

				{/* Header row */}
				<div className="flex items-center justify-between gap-3">
					{/* Left: title + season info */}
					<div className="flex items-baseline gap-3 min-w-0">
						<h2
							className="text-base md:text-lg font-bold text-white tracking-tight flex-shrink-0"
							style={{
								fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
							}}
						>
							Episodes
						</h2>
						{seasonData?.episodes && (
							<span className="text-[12px] text-white/28 tabular-nums font-medium truncate">
								{seasonData.episodes.length} ep
								{seasonData.episodes.length !== 1 ? 's' : ''}
								{seasonData.name && seasonData.name !== `Season ${activeSeason}` && (
									<span className="hidden sm:inline ml-1.5 text-white/20">
										· {seasonData.name}
									</span>
								)}
							</span>
						)}
					</div>

					{/* Right: view mode toggle */}
					<div
						className="flex items-center gap-0.5 p-[3px] rounded-[10px] flex-shrink-0"
						style={{
							background: 'rgba(255,255,255,0.055)',
							border: '1px solid rgba(255,255,255,0.07)',
						}}
					>
						{(
							[
								{ mode: 'grid', icon: <SquaresFourIcon size={15} weight="bold" />, label: 'Grid' },
								{ mode: 'list', icon: <ListBulletsIcon size={15} weight="bold" />, label: 'List' },
							] as { mode: EpisodeViewMode; icon: React.ReactNode; label: string }[]
						).map(({ mode, icon, label }) => (
							<motion.button
								key={mode}
								onClick={() => setViewMode(mode)}
								aria-label={label}
								whileTap={{ scale: 0.92 }}
								className={cn(
									'flex items-center justify-center w-7 h-7 rounded-[7px] transition-all duration-200',
									viewMode === mode
										? 'bg-white text-zinc-900 shadow-[0_1px_4px_rgba(0,0,0,0.35)]'
										: 'text-white/35 hover:text-white/65'
								)}
							>
								{icon}
							</motion.button>
						))}
					</div>
				</div>

				{/* Season pills */}
				{validSeasons.length > 1 && (
					<SeasonSelector
						seasons={validSeasons}
						activeSeason={activeSeason ?? validSeasons[0]?.season_number ?? 1}
						onSeasonChange={handleSeasonChange}
					/>
				)}

				{/* Episode strip — fades during season transition */}
				<div
					className="transition-opacity duration-300"
					style={{ opacity: isFetching ? 0.45 : 1 }}
				>
					<EpisodeStrip
						episodes={episodes}
						activeEpisodeId={activeEP?.id}
						onEpisodeClick={onEpisodeClick}
						viewMode={viewMode}
					/>
				</div>

			</div>
		</div>
	);
};

export default memo(SeasonTabs);
