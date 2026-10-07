'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { tmdbImage } from '@/lib/tmdb-image';
import useProviderStore from '@/store/providerStore';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import { useHaptics } from '@/hooks/use-haptics';
import { cn } from '@/lib/utils';

import { listEnabledProviders, resolveProvider } from './providers';
import { usePlaybackProgress } from './use-playback-progress';
import { PlayerControls } from './player-controls';

// A dead provider must surface as a failure instead of a black rectangle.
const PLAYER_LOAD_TIMEOUT_MS = 15_000;
// After this long without a load, offer an inline escape to another server
// while the current one keeps trying.
const SERVER_OFFER_TIMEOUT_MS = 8_000;

type PlayerStatus = 'loading' | 'ready' | 'failed';

interface EpisodeProps {
	episodeId: string;
	id: string;
	movieID?: unknown;
	type: string;
	episodeNumber?: number | string;
	seasonNumber?: number | string;
	/** Media title for the NOW PLAYING caption. Falls back to the watch history. */
	title?: string;
	getNextEp?: () => void;
	isSticky?: boolean;
	onCloseSticky?: () => void;
}

export default function Episode({
	id,
	type,
	seasonNumber,
	episodeNumber,
	title,
	getNextEp,
	isSticky,
	onCloseSticky,
}: EpisodeProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const haptic = useHaptics();
	const { selectedProvider, setProvider } = useProviderStore();
	const { setIsPlaying } = useEpisodeStore();
	const { recentlyWatched, updatePlaybackProgress, flushPlaybackProgress } =
		useTVShowStore();

	const numericMediaId = Number(id);
	const numericSeasonNumber =
		typeof seasonNumber === 'number' ? seasonNumber : Number(seasonNumber ?? 0);
	const numericEpisodeNumber =
		typeof episodeNumber === 'number' ? episodeNumber : Number(episodeNumber ?? 0);

	// ── Resume state ─────────────────────────────────────────────────────────
	// `iframeKey` forces the iframe to fully remount when incremented (e.g. on
	// explicit resume or provider switch). `activeResumeSeconds` is the position
	// baked into the URL at the time of the remount.
	const [iframeKey, setIframeKey] = useState(0);
	const [activeResumeSeconds, setActiveResumeSeconds] = useState(0);
	const [hasResumed, setHasResumed] = useState(false);
	// Memoised so the provider object is stable while the selection is: the URL
	// memo and the progress hook both key off it.
	const currentProvider = useMemo(() => resolveProvider(selectedProvider), [selectedProvider]);

	// Migrate persisted selections when a provider is unknown, candidate, or
	// disabled — resolveProvider already fell back to the default.
	useEffect(() => {
		if (currentProvider.id !== selectedProvider) setProvider(currentProvider.id);
	}, [currentProvider.id, selectedProvider, setProvider]);

	// Reset resume chip whenever the user switches providers so they can choose
	// to resume on the new provider too.
	useEffect(() => {
		setHasResumed(false);
	}, [selectedProvider]);

	// Mark playing state so other parts of the UI can react
	useEffect(() => {
		const timer = setTimeout(() => setIsPlaying(true), 100);
		return () => {
			clearTimeout(timer);
			setIsPlaying(false);
		};
	}, [setIsPlaying]);

	// ── Watch item ───────────────────────────────────────────────────────────
	const currentWatchItem = useMemo(
		() =>
			recentlyWatched.find((item) => {
				if (item.mediaId !== numericMediaId || item.mediaType !== type) return false;
				if (type === 'movie') return true;
				return (
					item.seasonNumber === numericSeasonNumber &&
					item.episodeNumber === numericEpisodeNumber
				);
			}),
		[recentlyWatched, numericMediaId, type, numericSeasonNumber, numericEpisodeNumber]
	);

	// The saved position shown in the resume chip (latest from the store)
	const savedPositionSeconds = Math.floor(currentWatchItem?.lastPositionSeconds ?? 0);

	// ── Resume handler ───────────────────────────────────────────────────────
	const handleResume = useCallback(() => {
		if (savedPositionSeconds <= 30) return;
		setActiveResumeSeconds(savedPositionSeconds);
		setHasResumed(true);
		// Increment key → iframe remounts with the new URL containing the resume param
		setIframeKey((k) => k + 1);
	}, [savedPositionSeconds]);

	// ── Build the current provider URL ───────────────────────────────────────
	// Pure string work, and the iframe remount is driven by `iframeKey` on the
	// element, so no memo is needed to keep the embed stable between renders.
	const currentUrl = currentProvider.buildUrl({
		type: type as 'movie' | 'tv',
		id,
		seasonNumber: numericSeasonNumber,
		episodeNumber: numericEpisodeNumber,
		resumeSeconds: activeResumeSeconds,
	});

	// ── Player status ─────────────────────────────────────────────────────────
	// A cross-origin embed fires `load` for its error pages too, so an embed
	// that reports playback through its progress adapter is only "ready" once
	// that first message lands. Without an adapter the load event is all there is.
	const [loadState, setLoadState] = useState<'pending' | 'loaded' | 'failed'>('pending');
	const [playbackSeen, setPlaybackSeen] = useState(false);
	const [showServerOffer, setShowServerOffer] = useState(false);
	const needsPlaybackSignal = Boolean(currentProvider.progress?.origin);

	const status: PlayerStatus =
		loadState === 'failed'
			? 'failed'
			: needsPlaybackSignal
				? playbackSeen
					? 'ready'
					: 'loading'
				: loadState === 'loaded'
					? 'ready'
					: 'loading';

	const handlePlaybackSignal = useCallback(() => setPlaybackSeen(true), []);

	useEffect(() => {
		setLoadState('pending');
		setPlaybackSeen(false);
		setShowServerOffer(false);
	}, [currentUrl]);

	useEffect(() => {
		if (status !== 'loading') return;
		const offerTimer = setTimeout(() => setShowServerOffer(true), SERVER_OFFER_TIMEOUT_MS);
		const failTimer = setTimeout(() => setLoadState('failed'), PLAYER_LOAD_TIMEOUT_MS);
		return () => {
			clearTimeout(offerTimer);
			clearTimeout(failTimer);
		};
	}, [status, currentUrl]);

	const handleIframeLoad = useCallback(() => setLoadState('loaded'), []);

	const handleRetry = useCallback(() => {
		setLoadState('pending');
		setPlaybackSeen(false);
		setShowServerOffer(false);
		setIframeKey((k) => k + 1);
	}, []);

	const handleTryAnotherServer = useCallback(() => {
		const list = listEnabledProviders();
		const index = list.findIndex((p) => p.id === currentProvider.id);
		const next = list[(index + 1) % list.length];
		if (next && next.id !== currentProvider.id) {
			setProvider(next.id);
		} else {
			handleRetry();
		}
	}, [currentProvider.id, setProvider, handleRetry]);

	// ── Episode navigation ───────────────────────────────────────────────────
	// The episode strip owns the list, so stepping back only rewrites the URL;
	// the strip re-reads it and moves the highlight and the store with it.
	const canGoPrevious = type === 'tv' && numericEpisodeNumber > 1;

	const goPreviousEpisode = useCallback(() => {
		if (!canGoPrevious) return;
		haptic('selection');
		const params = new URLSearchParams(searchParams.toString());
		params.set('season', String(numericSeasonNumber));
		params.set('episode', String(numericEpisodeNumber - 1));
		window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
	}, [
		canGoPrevious,
		haptic,
		numericEpisodeNumber,
		numericSeasonNumber,
		pathname,
		searchParams,
	]);

	const goNextEpisode = useCallback(() => {
		if (!getNextEp) return;
		haptic('selection');
		getNextEp();
	}, [getNextEp, haptic]);

	// ── Captions and poster ───────────────────────────────────────────────────
	const seasonEpisodeLabel =
		type === 'tv' && numericSeasonNumber > 0 && numericEpisodeNumber > 0
			? `S${numericSeasonNumber} E${numericEpisodeNumber}`
			: null;
	const titleLabel = title?.trim();
	// An unplayed film has no watch-history entry, so the prop leads and the
	// store covers every caller that does not pass one.
	const nowPlayingSubject =
		type === 'movie'
			? titleLabel || currentWatchItem?.title?.trim() || currentWatchItem?.showName?.trim() || 'Movie'
			: (currentWatchItem?.episodeName?.trim() ?? null);
	const nowPlayingCaption = seasonEpisodeLabel
		? `Now playing · ${seasonEpisodeLabel}${nowPlayingSubject ? ` · ${nowPlayingSubject}` : ''}`
		: `Now playing · ${type === 'movie' ? nowPlayingSubject : 'Episode'}`;
	const loadingCaption = seasonEpisodeLabel
		? `Loading ${seasonEpisodeLabel}`
		: `Loading ${type === 'movie' ? nowPlayingSubject : 'episode'}`;
	const posterUrl = currentWatchItem?.stillPath
		? tmdbImage(currentWatchItem.stillPath, 'w780')
		: null;
	const [posterError, setPosterError] = useState(false);

	// ── Document title ────────────────────────────────────────────────────────
	useEffect(() => {
		const previousTitle = document.title;
		const showLabel = currentWatchItem?.showName?.trim();
		const episodeNameLabel = currentWatchItem?.episodeName?.trim();
		const itemTitle = titleLabel || currentWatchItem?.title?.trim();
		const episodeLabel =
			type === 'tv' && numericSeasonNumber > 0 && numericEpisodeNumber > 0
				? `S${numericSeasonNumber} E${numericEpisodeNumber}`
				: null;
		const subject = showLabel
			? episodeLabel
				? `${showLabel} ${episodeLabel}`
				: showLabel
			: episodeLabel || episodeNameLabel || itemTitle || 'Now playing';
		document.title = `${subject} · Spicy TV`;
		return () => {
			document.title = previousTitle;
		};
	}, [currentWatchItem, titleLabel, type, numericSeasonNumber, numericEpisodeNumber]);

	// ── Progress tracking ────────────────────────────────────────────────────
	usePlaybackProgress({
		id,
		type,
		numericMediaId,
		numericSeasonNumber,
		numericEpisodeNumber,
		provider: currentProvider,
		currentWatchItem,
		updatePlaybackProgress,
		flushPlaybackProgress,
		onPlaybackSignal: handlePlaybackSignal,
	});

	const isReady = status === 'ready';

	return (
		<div className="flex flex-col">
			<p className="mb-2 font-mono text-caption uppercase tracking-label text-dim">
				{nowPlayingCaption}
			</p>

			<div className="relative w-full overflow-hidden rounded-md border border-line bg-canvas">
				<div className="relative aspect-video max-h-140 min-h-70 w-full">
					<iframe
						key={iframeKey}
						ref={iframeRef}
						allowFullScreen
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
						className="absolute inset-0 block size-full bg-transparent"
						src={currentUrl}
						title={`${currentProvider.label} player`}
						loading="eager"
						onLoad={handleIframeLoad}
					/>

					{/* The still sits over the embed, not under it: a provider error
					    page would otherwise show as a white box. */}
					{posterUrl && !posterError && (
						<img
							src={posterUrl}
							alt=""
							aria-hidden="true"
							loading="eager"
							decoding="async"
							onError={() => setPosterError(true)}
							className={cn(
								'pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-(--duration-fade) motion-reduce:transition-none',
								isReady ? 'opacity-0' : 'opacity-100'
							)}
						/>
					)}

					{/* State overlay — occupies the player box so loading, failure and
					    playback reserve identical height. Never blocks the embed, so
					    the viewer can always press play. */}
					<div
						className={cn(
							'pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/75 px-6 text-center transition-opacity duration-(--duration-fade) motion-reduce:transition-none',
							isReady ? 'opacity-0' : 'opacity-100'
						)}
						aria-hidden={isReady ? true : undefined}
					>
						{status === 'loading' && (
							<div className="flex flex-col items-center gap-4">
								<p
									aria-hidden="true"
									className="font-mono text-caption uppercase tracking-label text-muted-foreground"
								>
									{loadingCaption}
								</p>
								<div
									aria-hidden="true"
									className="h-0.5 w-40 overflow-hidden rounded-full bg-foreground/10"
								>
									<div className="h-full w-1/2 animate-shimmer bg-brand motion-reduce:animate-none" />
								</div>
								{showServerOffer && (
									<Button
										type="button"
										variant="ghost"
										onClick={handleTryAnotherServer}
										className="pointer-events-auto"
									>
										Try another server
									</Button>
								)}
							</div>
						)}

						{status === 'failed' && (
							<div
								role="alert"
								aria-live="assertive"
								className="pointer-events-auto flex max-w-sm flex-col items-center gap-3"
							>
								<p className="font-mono text-caption uppercase tracking-label text-dim">
									Source · {currentProvider.label}
								</p>
								<h3 className="text-lede font-medium text-foreground">
									The projector jammed.
								</h3>
								<p className="max-w-sm text-small leading-relaxed text-soft">
									This source did not answer. Try another server, or retry{' '}
									{currentProvider.label}.
								</p>
								<div className="mt-2 flex flex-wrap items-center justify-center gap-2">
									<Button type="button" onClick={handleTryAnotherServer}>
										Try another server
									</Button>
									<Button type="button" variant="ghost" onClick={handleRetry}>
										Retry
									</Button>
								</div>
							</div>
						)}
					</div>

					<p className="sr-only" role="status" aria-live="polite">
						{status === 'loading'
							? 'Loading the player.'
							: status === 'ready'
								? 'Player loaded.'
								: ''}
					</p>
				</div>
			</div>

			<div className="mt-3">
				<PlayerControls
					providers={listEnabledProviders()}
					selectedProvider={currentProvider.id}
					onProviderChange={setProvider}
					savedPositionSeconds={savedPositionSeconds}
					onResume={handleResume}
					hasResumed={hasResumed}
					onNextEpisode={goNextEpisode}
					onPreviousEpisode={goPreviousEpisode}
					canGoPrevious={canGoPrevious}
					mediaType={type}
					isSticky={isSticky}
					onCloseSticky={onCloseSticky}
				/>
			</div>
		</div>
	);
}
