'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { useHaptics } from '@/hooks/use-haptics';
import { WarningCircleIcon } from '@phosphor-icons/react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { fetchSeasonEpisodesFromApi } from '@/lib/api/tmdb-row-client';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import {
	parseEpisodeParam,
	parseSeasonParam,
} from '@/components/features/media/player/deep-link-params';
import { isReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Episode as EpisodeType, SeasonTabsProps } from '@/lib/types';
import type { TMDBEpisode, TMDBSeasonDetails } from '@/lib/types/tmdb';
import { SeasonSelector } from './season-selector';
import { EpisodeStrip } from './episode-strip';

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

	const episodeContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		setIsPlayerSticky(false);
		return () => setIsPlayerSticky(false);
	}, [setIsPlayerSticky]);

	// Order seasons: regular seasons ascending, specials (season 0) last
	const validSeasons = useMemo(() => {
		if (!seasons?.length) return [];
		const regular = seasons.filter((s) => s.season_number > 0).sort((a, b) => a.season_number - b.season_number);
		const specials = seasons.filter((s) => s.season_number === 0);
		return [...regular, ...specials];
	}, [seasons]);

	const validSeasonNumbers = useMemo(
		() => validSeasons.map((s) => s.season_number),
		[validSeasons]
	);

	const [activeSeason, setActiveSeason] = useState<number | null>(null);

	// Data fetching for the active season
	const {
		data: seasonData,
		isFetching,
		isError,
		isPlaceholderData,
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

	// Init from URL — invalid or out-of-range values fall back to the first valid season
	useEffect(() => {
		const sParam = parseSeasonParam(searchParams.get('season'), validSeasonNumbers);
		if (sParam !== null) {
			setActiveSeason(sParam);
		} else if (validSeasons.length > 0) {
			setActiveSeason(validSeasons[0].season_number);
		}
	}, [validSeasons, validSeasonNumbers, searchParams]);

	// Init active episode from URL when episodes load
	useEffect(() => {
		const sParam = parseSeasonParam(searchParams.get('season'), validSeasonNumbers);
		const eParam = parseEpisodeParam(searchParams.get('episode'), episodes.length);
		if (episodes.length && eParam !== null && sParam !== null && sParam === activeSeason) {
			const ep = episodes.find(
				(e) => e.season_number === sParam && e.episode_number === eParam
			);
			if (ep && activeEP?.id !== ep.id) {
				setActiveEP(ep);
				addRecentlyWatched(ep);
			}
		}
	}, [
		episodes,
		searchParams,
		validSeasonNumbers,
		activeSeason,
		activeEP,
		setActiveEP,
		addRecentlyWatched,
	]);

	// Cross-fade animation on season switch
	const handleSeasonChange = useCallback(
		(sNum: number) => {
			if (sNum === activeSeason) return;
			haptic('selection');

			const container = episodeContainerRef.current;
			const reduced = isReducedMotion();

			const swapSeason = () => {
				setActiveSeason(sNum);
				const params = new URLSearchParams(searchParams.toString());
				params.set('season', String(sNum));
				params.delete('episode');
				window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
			};

			if (!reduced && container) {
				gsap.killTweensOf(container);
				gsap.to(container, {
					opacity: 0,
					duration: 0.16,
					ease: 'power2.in',
					onComplete: () => {
						swapSeason();
					},
				});
			} else {
				swapSeason();
			}
		},
		[activeSeason, haptic, pathname, searchParams]
	);

	// The switch fades out, then back in only once the new season's episodes are in, never the old ones.
	useEffect(() => {
		const container = episodeContainerRef.current;
		if (!container || isPlaceholderData) return;
		gsap.killTweensOf(container);
		gsap.to(container, {
			opacity: 1,
			duration: isReducedMotion() ? 0.18 : 0.28,
			ease: 'power2.out',
			clearProps: 'opacity',
		});
	}, [activeSeason, seasonData, isPlaceholderData]);

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
					behavior: isReducedMotion() ? 'auto' : 'smooth',
					block: 'start',
				});
			});
		},
		[pathname, searchParams, setActiveEP, addRecentlyWatched]
	);

	// Next episode handler
	const handleNextEpisode = useCallback(() => {
		let current = activeEP;
		if (!current && episodes.length > 0) {
			const sParam = parseSeasonParam(searchParams.get('season'), validSeasonNumbers);
			const eParam = parseEpisodeParam(searchParams.get('episode'), episodes.length);
			if (sParam !== null && eParam !== null) {
				const found = episodes.find(
					(ep) => ep.season_number === sParam && ep.episode_number === eParam
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
	}, [
		activeEP,
		episodes,
		activeSeason,
		validSeasons,
		validSeasonNumbers,
		pathname,
		searchParams,
		onEpisodeClick,
	]);

	const urlSeason = parseSeasonParam(searchParams.get('season'), validSeasonNumbers);

	if (isError) {
		return (
			<div className="flex flex-col items-start gap-4 border-y border-line py-12">
				<p className="m-0 flex items-center gap-2 font-mono text-caption uppercase tracking-label text-destructive">
					<WarningCircleIcon size={14} weight="fill" aria-hidden="true" />
					Error
				</p>
				<h2 className="m-0 font-display text-display-3 uppercase leading-none text-foreground">
					The reel jammed.
				</h2>
				<p className="m-0 text-body text-soft">Episodes could not load. Try again.</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="pressable h-12 rounded-full bg-brand px-5 text-body font-semibold text-brand-foreground transition-[background-color,scale] duration-(--duration-ui) can-hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
				>
					Try again
				</button>
			</div>
		);
	}

	const seasonsCount = validSeasons.length;
	const countText =
		episodes.length > 0
			? `${episodes.length} ${episodes.length === 1 ? 'episode' : 'episodes'}`
			: seasonsCount > 0
				? `${seasonsCount} ${seasonsCount === 1 ? 'season' : 'seasons'}`
				: '';

	return (
		<div className="flex w-full flex-col gap-6">
			{/* PLAYER */}
			{hasActiveEpisode && (
				<div
					id="media-player"
					data-player-container
					className="relative z-10 w-full border-b border-line pb-6"
				>
					<TVContainer
						showId={showId}
						getNextEp={handleNextEpisode}
						seasons={validSeasonNumbers}
						episodeCount={
							urlSeason !== null && urlSeason === activeSeason
								? episodes.length
								: undefined
						}
					/>
				</div>
			)}

			{detailsPanel}

			{/* SEASON SELECTOR + EPISODES */}
			<section
				id="episodes"
				aria-labelledby="episodes-title"
				className={cn('scroll-mt-24 flex flex-col', hasActiveEpisode && 'mt-section')}
			>
				{/* Section heading matching prototype */}
				<div className="flex items-end justify-between border-b border-line-strong pb-4 mb-6">
					<div className="flex items-baseline gap-3">
						<span className="font-mono text-caption text-brand tracking-label tabular-nums" aria-hidden="true">
							01
						</span>
						<h2 id="episodes-title" className="font-display text-display-2 uppercase leading-none text-foreground m-0">
							Episodes
						</h2>
					</div>
					{countText && (
						<span className="font-mono text-caption text-dim tracking-label uppercase tabular-nums">
							{countText}
						</span>
					)}
				</div>

				{/* Season tabs */}
				{validSeasons.length > 1 && (
					<div className="mb-6">
						<SeasonSelector
							seasons={validSeasons}
							activeSeason={activeSeason ?? validSeasons[0]?.season_number ?? 1}
							onSeasonChange={handleSeasonChange}
						/>
					</div>
				)}

				{/* Episode list with season cross-fade */}
				<div ref={episodeContainerRef} className="w-full">
					<EpisodeStrip
						episodes={episodes}
						activeEpisodeId={activeEpisodeForShow?.id}
						onEpisodeClick={onEpisodeClick}
						isLoading={isFetching && !episodes.length}
						progressEpisodeId={savedProgress?.episodeId}
						progressPercent={savedProgress?.progressPercent}
					/>
				</div>
			</section>
		</div>
	);
};

export default memo(SeasonTabs);
