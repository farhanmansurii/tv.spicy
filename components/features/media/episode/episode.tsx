'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useProviderStore from '@/store/providerStore';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';

import { listEnabledProviders, resolveProvider } from './providers';
import { usePlaybackProgress } from './use-playback-progress';
import { PlayerControls } from './player-controls';

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
	const { recentlyWatched, updatePlaybackProgress } = useTVShowStore();

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
				<div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black">
					<iframe
						key={iframeKey}
						ref={iframeRef}
						allowFullScreen
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
						className="block h-full w-full bg-transparent"
						src={currentUrl}
						title="Media Player"
						loading="eager"
					/>
				</div>
			</div>
		</>
	);
}
