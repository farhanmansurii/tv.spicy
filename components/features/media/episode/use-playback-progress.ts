'use client';

import { useEffect, useRef } from 'react';

import type { ContinueWatchingItem } from '@/lib/continue-watching';
import { getProvider } from './providers';

interface UsePlaybackProgressParams {
	id: string;
	type: string;
	numericMediaId: number;
	numericSeasonNumber: number;
	numericEpisodeNumber: number;
	selectedProvider: string;
	currentWatchItem: ContinueWatchingItem | undefined;
	updatePlaybackProgress: (input: {
		mediaId: string;
		mediaType?: 'movie' | 'tv';
		progressPercent?: number | null;
		lastPositionSeconds?: number | null;
		durationSeconds?: number | null;
		seasonNumber?: number | null;
		episodeNumber?: number | null;
	}) => Promise<void>;
}

/**
 * Handles all playback progress tracking in one place:
 *
 * 1. postMessage tracking — for providers that emit accurate player events
 *    (e.g. Vidking). Wired up automatically when the provider has a
 *    `postMessageOrigin` + `parseProgressMessage` config.
 *
 * 2. Time-based fallback — for every other provider. Ticks every 15 s and
 *    estimates position from wall-clock time. Requires `durationSeconds` to
 *    be already known in the store (populated from a previous postMessage
 *    session). Silently skips when duration is absent.
 */
export function usePlaybackProgress({
	id,
	type,
	numericMediaId,
	numericSeasonNumber,
	numericEpisodeNumber,
	selectedProvider,
	currentWatchItem,
	updatePlaybackProgress,
}: UsePlaybackProgressParams): void {
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// ── 1. postMessage progress tracking ─────────────────────────────────────
	useEffect(() => {
		const provider = getProvider(selectedProvider);
		if (!provider.postMessageOrigin || !provider.parseProgressMessage) return;

		const origin = provider.postMessageOrigin;
		const parse = provider.parseProgressMessage;

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== origin) return;

			const parsed = parse(event.data, {
				id,
				numericMediaId,
				type,
				season: numericSeasonNumber,
				episode: numericEpisodeNumber,
			});
			if (!parsed) return;

			if (debounceRef.current) clearTimeout(debounceRef.current);

			debounceRef.current = setTimeout(
				() => {
					void updatePlaybackProgress({
						mediaId: String(parsed.mediaId),
						mediaType: type as 'movie' | 'tv',
						progressPercent: Number.isFinite(parsed.progress) ? parsed.progress : null,
						lastPositionSeconds: Number.isFinite(parsed.currentTime)
							? parsed.currentTime
							: null,
						durationSeconds: Number.isFinite(parsed.duration) ? parsed.duration : null,
						seasonNumber:
							type === 'tv' && Number.isFinite(parsed.season) ? parsed.season : null,
						episodeNumber:
							type === 'tv' && Number.isFinite(parsed.episode)
								? parsed.episode
								: null,
					});
				},
				parsed.eventName === 'timeupdate' ? 1000 : 150
			);
		};

		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('message', handleMessage);
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
				debounceRef.current = null;
			}
		};
	}, [
		id,
		numericEpisodeNumber,
		numericMediaId,
		numericSeasonNumber,
		selectedProvider,
		type,
		updatePlaybackProgress,
	]);

	// ── 2. Time-based fallback ────────────────────────────────────────────────
	// Only fires when the current provider has no postMessage support.
	// Requires `durationSeconds` in the store — skips silently otherwise.
	useEffect(() => {
		const provider = getProvider(selectedProvider);
		if (provider.postMessageOrigin) return; // handled above
		if (!currentWatchItem) return;

		const duration = currentWatchItem.durationSeconds;
		if (!duration || duration <= 0) return;

		const watchStart = Date.now();
		const startPosition = currentWatchItem.lastPositionSeconds ?? 0;

		const intervalId = setInterval(() => {
			const elapsed = (Date.now() - watchStart) / 1000;
			const estimatedPosition = startPosition + elapsed;

			void updatePlaybackProgress({
				mediaId: id,
				mediaType: type as 'movie' | 'tv',
				progressPercent: (estimatedPosition / duration) * 100,
				lastPositionSeconds: estimatedPosition,
				durationSeconds: duration,
				seasonNumber: numericSeasonNumber || null,
				episodeNumber: numericEpisodeNumber || null,
			});
		}, 15_000);

		return () => clearInterval(intervalId);
	}, [
		selectedProvider,
		// Stable identifiers only — avoids re-subscribing on every progress tick
		currentWatchItem?.id,
		currentWatchItem?.durationSeconds,
		currentWatchItem?.lastPositionSeconds,
		id,
		type,
		numericSeasonNumber,
		numericEpisodeNumber,
		updatePlaybackProgress,
	]);
}
