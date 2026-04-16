'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useProviderStore from '@/store/providerStore';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';

import { PROVIDERS, getProvider } from './providers';
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

	// ── Build provider URLs ──────────────────────────────────────────────────
	// `activeResumeSeconds` and `iframeKey` are intentionally in deps here so
	// URLs only rebuild (and the iframe only remounts) on an explicit user action.
	const sources = useMemo(
		() =>
			PROVIDERS.map((provider) => ({
				name: provider.name,
				label: provider.label,
				url: provider.buildUrl({
					type: type as 'movie' | 'tv',
					id,
					seasonNumber: numericSeasonNumber,
					episodeNumber: numericEpisodeNumber,
					resumeSeconds: activeResumeSeconds,
				}),
			})),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[type, id, numericSeasonNumber, numericEpisodeNumber, activeResumeSeconds, iframeKey]
	);

	const currentSource = sources.find((s) => s.name === selectedProvider) ?? sources[0];
	const currentProvider = getProvider(selectedProvider);

	// ── Progress tracking ────────────────────────────────────────────────────
	usePlaybackProgress({
		id,
		type,
		numericMediaId,
		numericSeasonNumber,
		numericEpisodeNumber,
		selectedProvider,
		currentWatchItem,
		updatePlaybackProgress,
	});

	return (
		<div className="group relative w-full flex flex-col gap-2">
			<PlayerControls
				providers={PROVIDERS}
				selectedProvider={selectedProvider}
				currentLabel={currentProvider.label}
				onProviderChange={setProvider}
				savedPositionSeconds={savedPositionSeconds}
				onResume={handleResume}
				hasResumed={hasResumed}
				onNextEpisode={getNextEp}
				mediaType={type}
				isSticky={isSticky}
				onCloseSticky={onCloseSticky}
			/>

			<div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl group-hover:ring-white/20 transition-[box-shadow,border-color] duration-300">
				<iframe
					key={iframeKey}
					ref={iframeRef}
					allowFullScreen
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
					className="w-full h-full"
					src={currentSource.url}
					title="Media Player"
					loading="eager"
				/>
				{/* Inset ring for depth */}
				<div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-xl" />
			</div>
		</div>
	);
}
