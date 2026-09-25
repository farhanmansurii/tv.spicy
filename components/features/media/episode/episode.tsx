'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleNotchIcon, WarningCircleIcon } from '@phosphor-icons/react';
import useProviderStore from '@/store/providerStore';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import { cn } from '@/lib/utils';

import { listEnabledProviders, resolveProvider } from './providers';
import { usePlaybackProgress } from './use-playback-progress';
import { PlayerControls } from './player-controls';

// A dead provider must surface as a failure instead of a black rectangle.
const PLAYER_LOAD_TIMEOUT_MS = 15_000;

type PlayerStatus = 'loading' | 'ready' | 'failed';

interface EpisodeProps {
	episodeId: string;
	id: string;
	movieID?: unknown;
	type: string;
	episodeNumber?: number | string;
	seasonNumber?: number | string;
	getNextEp?: () => void;
	isSticky?: boolean;
	onCloseSticky?: () => void;
}

export default function Episode({
	id,
	type,
	seasonNumber,
	episodeNumber,
	getNextEp,
	isSticky,
	onCloseSticky,
}: EpisodeProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
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
	const currentProvider = resolveProvider(selectedProvider);

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
	// Only the selected provider's URL is built. `activeResumeSeconds` and
	// `iframeKey` are intentionally in deps here so the URL only rebuilds (and
	// the iframe only remounts) on an explicit user action.
	const currentUrl = useMemo(
		() =>
			currentProvider.buildUrl({
				type: type as 'movie' | 'tv',
				id,
				seasonNumber: numericSeasonNumber,
				episodeNumber: numericEpisodeNumber,
				resumeSeconds: activeResumeSeconds,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			currentProvider.id,
			type,
			id,
			numericSeasonNumber,
			numericEpisodeNumber,
			activeResumeSeconds,
			iframeKey,
		]
	);

	// ── Player status ─────────────────────────────────────────────────────────
	// Every URL change (provider switch, retry, resume) remounts the iframe, so
	// the load cycle starts over.
	const [status, setStatus] = useState<PlayerStatus>('loading');

	useEffect(() => {
		setStatus('loading');
	}, [currentUrl]);

	useEffect(() => {
		if (status !== 'loading') return;
		const timer = setTimeout(() => setStatus('failed'), PLAYER_LOAD_TIMEOUT_MS);
		return () => clearTimeout(timer);
	}, [status, currentUrl]);

	const handleIframeLoad = useCallback(() => setStatus('ready'), []);

	const handleRetry = useCallback(() => {
		setStatus('loading');
		setIframeKey((k) => k + 1);
	}, []);

	// ── Document title ────────────────────────────────────────────────────────
	useEffect(() => {
		const previousTitle = document.title;
		const showLabel = currentWatchItem?.showName?.trim();
		const episodeNameLabel = currentWatchItem?.episodeName?.trim();
		const itemTitle = currentWatchItem?.title?.trim();
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
	}, [currentWatchItem, type, numericSeasonNumber, numericEpisodeNumber]);

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
	});

	return (
		<>
			<PlayerControls
				providers={listEnabledProviders()}
				selectedProvider={currentProvider.id}
				onProviderChange={setProvider}
				savedPositionSeconds={savedPositionSeconds}
				onResume={handleResume}
				hasResumed={hasResumed}
				onNextEpisode={getNextEp}
				mediaType={type}
				isSticky={isSticky}
				onCloseSticky={onCloseSticky}
			/>

			<div className="relative mt-1 w-full rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.35)]">
				<div className="relative w-full h-[50vh] min-h-[280px] max-h-[560px] overflow-hidden rounded-xl bg-black sm:aspect-video sm:h-auto sm:min-h-0">
					<iframe
						key={iframeKey}
						ref={iframeRef}
						allowFullScreen
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
						className="block h-full w-full bg-transparent"
						src={currentUrl}
						title={`${currentProvider.label} player`}
						loading="eager"
						onLoad={handleIframeLoad}
					/>

					{/* State overlay — occupies the player box so loading, failure and
					    playback reserve identical height. */}
					<div
						className={cn(
							'absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center transition-opacity motion-reduce:transition-none',
							status === 'ready'
								? 'pointer-events-none opacity-0 duration-[120ms]'
								: 'opacity-100 duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]'
						)}
						aria-hidden={status === 'ready' ? true : undefined}
					>
						{status === 'loading' && (
							<div className="flex flex-col items-center gap-3">
								<CircleNotchIcon
									size={32}
									weight="bold"
									aria-hidden="true"
									className="animate-spin text-white/70 motion-reduce:animate-none"
								/>
								<p aria-hidden="true" className="text-sm font-medium text-white/70">
									Loading player…
								</p>
							</div>
						)}

						{status === 'failed' && (
							<div
								role="alert"
								aria-live="assertive"
								className="flex max-w-sm flex-col items-center gap-3"
							>
								<WarningCircleIcon
									size={32}
									weight="fill"
									aria-hidden="true"
									className="text-[#FF453A]"
								/>
								<h3 className="text-base font-semibold text-white md:text-lg">
									Playback failed
								</h3>
								<p className="text-sm leading-relaxed text-white/70">
									This source didn’t respond in time. Retry it, or pick another
									source above.
								</p>
								<button
									type="button"
									onClick={handleRetry}
									className={cn(
										'min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black',
										'transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100',
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
									)}
								>
									Retry
								</button>
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
		</>
	);
}
