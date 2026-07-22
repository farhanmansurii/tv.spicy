'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useHaptics } from '@/hooks/use-haptics';
import { motion } from 'framer-motion';
import { SquaresFourIcon, ListBulletsIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchSeasonEpisodesFromApi } from '@/lib/api/tmdb-row-client';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import { cn } from '@/lib/utils';
import type { Episode as EpisodeType, SeasonTabsProps } from '@/lib/types';
import type { TMDBEpisode, TMDBSeasonDetails } from '@/lib/types/tmdb';
import { SeasonSelector } from './season-selector';
import { EpisodeStrip, type EpisodeViewMode } from './episode-strip';

const SeasonTabs = ({ seasons, showId, showData, detailsPanel }: SeasonTabsProps) => {
	const haptic = useHaptics();
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
	const activeEpisodeForShow =
		activeEP && String(activeEP.tv_id) === String(showId) ? activeEP : null;
	const hasActiveEpisode = !!activeEpisodeForShow;
	const { addRecentlyWatched, recentlyWatched } = useTVShowStore();

	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile for the default episode layout. The player remains in-flow on phones.
	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 768);

		check();
		window.addEventListener('resize', check, { passive: true });
		return () => window.removeEventListener('resize', check);
	}, []);

	useEffect(() => {
		setIsPlayerSticky(false);
		return () => setIsPlayerSticky(false);
	}, [setIsPlayerSticky]);

	// State
	const validSeasons = useMemo(
		() => seasons?.filter((s) => s.season_number > 0) || seasons || [],
		[seasons]
	);
	const [activeSeason, setActiveSeason] = useState<number | null>(null);
	const [viewMode, setViewMode] = useState<EpisodeViewMode>(isMobile ? 'list' : 'grid');

	// Data
	const {
		data: seasonData,
		isFetching,
		isError,
		refetch,
	} = useQuery<TMDBSeasonDetails>({
		queryKey: ['episodes', showId, activeSeason],
		queryFn: () => fetchSeasonEpisodesFromApi(showId, activeSeason as number),
		enabled: !!showId && activeSeason !== null,
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
	});

	const episodes = useMemo(
		() => seasonData?.episodes?.map(hydrateEpisode) || [],
		[seasonData, hydrateEpisode]
	);
	const savedProgress = recentlyWatched.find(
		(item) =>
			item.mediaType === 'tv' &&
			String(item.mediaId) === String(showId) &&
			item.seasonNumber === activeSeason
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
			window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
		},
		[haptic, pathname, searchParams]
	);

	const onEpisodeClick = useCallback(
		(episode: EpisodeType, _event?: React.MouseEvent) => {
			setActiveEP(episode);
			addRecentlyWatched(episode);
			const params = new URLSearchParams(searchParams.toString());
			params.set('season', String(episode.season_number));
			params.set('episode', String(episode.episode_number));
			window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
			requestAnimationFrame(() => {
				document.getElementById('media-player')?.scrollIntoView({
					behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
						? 'auto'
						: 'smooth',
					block: 'start',
				});
			});
		},
		[pathname, searchParams, setActiveEP, addRecentlyWatched]
	);

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
			window.history.pushState(null, '', `${pathname}?${params.toString()}`);
		}
	}, [activeEP, episodes, activeSeason, validSeasons, pathname, searchParams, onEpisodeClick]);

	if (isError)
		return (
			<div className="flex flex-col items-center py-20 gap-4 text-destructive">
				<WarningCircleIcon size={32} weight="fill" />
				<p className="font-bold">Failed to load episodes. Please try again.</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black active:scale-[0.97]"
				>
					Try Again
				</button>
			</div>
		);

	return (
		<div className="flex w-full flex-col gap-4 md:gap-6">
			{/* PLAYER */}
			{hasActiveEpisode && (
				<div id="media-player" data-player-container className="relative z-10 w-full">
					<TVContainer showId={showId} getNextEp={handleNextEpisode} />
				</div>
			)}

			{detailsPanel}

			{/* SEASON SELECTOR + EPISODES */}
			<div id="episodes-section" className="scroll-mt-24 space-y-3 md:space-y-4">
				{/* Header row */}
				<div className="flex items-center justify-between gap-3">
					{/* Left: title + season info */}
					<div className="flex items-baseline gap-3 min-w-0">
						<h2 className="text-base md:text-lg font-bold text-white tracking-tight flex-shrink-0 font-sans">
							Episodes
						</h2>
						{seasonData?.episodes && (
							<span className="text-[12px] text-white/28 tabular-nums font-medium truncate">
								{seasonData.episodes.length} ep
								{seasonData.episodes.length !== 1 ? 's' : ''}
								{seasonData.name &&
									seasonData.name !== `Season ${activeSeason}` && (
										<span className="hidden sm:inline ml-1.5 text-white/20">
											· {seasonData.name}
										</span>
									)}
							</span>
						)}
					</div>

					{/* Right: view mode toggle */}
					<div
						className="flex flex-shrink-0 items-center gap-0.5 rounded-[10px] p-[3px]"
						style={{
							background: 'rgba(255,255,255,0.055)',
							border: '1px solid rgba(255,255,255,0.07)',
						}}
					>
						{(
							[
								{
									mode: 'grid',
									icon: <SquaresFourIcon size={15} weight="bold" />,
									label: 'Grid',
								},
								{
									mode: 'list',
									icon: <ListBulletsIcon size={15} weight="bold" />,
									label: 'List',
								},
							] as { mode: EpisodeViewMode; icon: React.ReactNode; label: string }[]
						).map(({ mode, icon, label }) => (
							<motion.button
								key={mode}
								onClick={() => setViewMode(mode)}
								aria-label={label}
								whileTap={{ scale: 0.92 }}
								className={cn(
									'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
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
					className="transition-opacity duration-200 motion-reduce:transition-none"
					style={{ opacity: isFetching && episodes.length ? 0.72 : 1 }}
				>
					<EpisodeStrip
						episodes={episodes}
						activeEpisodeId={activeEpisodeForShow?.id}
						onEpisodeClick={onEpisodeClick}
						viewMode={viewMode}
						isLoading={isFetching && !episodes.length}
						progressEpisodeId={savedProgress?.episodeId}
						progressPercent={savedProgress?.progressPercent}
					/>
				</div>
			</div>
		</div>
	);
};

export default memo(SeasonTabs);
