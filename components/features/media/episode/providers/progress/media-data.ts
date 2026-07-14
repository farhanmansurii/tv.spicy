/**
 * Adapter for the VidZen MEDIA_DATA snapshot model — completely different
 * from PLAYER_EVENT:
 *  • Event type: MEDIA_DATA, carrying the whole progress store keyed by
 *    TMDB ID string, with `watched`/`duration` fields
 *  • TV shows: per-episode progress in `show_progress["s{N}e{N}"]`
 */

import { coercePayload, type ProgressAdapter } from './types';

export const parseMediaData: ProgressAdapter = (data, { numericMediaId, type, season, episode }) => {
	const payload = coercePayload(data);
	if (!payload || payload.type !== 'MEDIA_DATA') return null;

	const store = payload.data as Record<string, unknown> | undefined;
	if (!store || typeof store !== 'object') return null;

	const entry = store[String(numericMediaId)] as Record<string, unknown> | undefined;
	if (!entry) return null;

	let currentTime: number;
	let duration: number;

	if (type === 'tv' && season > 0 && episode > 0) {
		// Prefer episode-specific progress when available
		const showProgress = entry.show_progress as Record<string, unknown> | undefined;
		const epEntry = showProgress?.[`s${season}e${episode}`] as Record<string, unknown> | undefined;
		const epProg = epEntry?.progress as Record<string, unknown> | undefined;

		if (epProg) {
			currentTime = Number(epProg.watched ?? 0);
			duration = Number(epProg.duration ?? 0);
		} else {
			// Fall back to the overall progress field (last-watched episode)
			const prog = entry.progress as Record<string, unknown> | undefined;
			currentTime = Number(prog?.watched ?? 0);
			duration = Number(prog?.duration ?? 0);
		}
	} else {
		const prog = entry.progress as Record<string, unknown> | undefined;
		currentTime = Number(prog?.watched ?? 0);
		duration = Number(prog?.duration ?? 0);
	}

	if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return null;

	return {
		// MEDIA_DATA is a progress snapshot — always treat as timeupdate
		eventName: 'timeupdate',
		mediaId: numericMediaId,
		currentTime,
		duration,
		progress: duration > 0 ? (currentTime / duration) * 100 : 0,
		season: type === 'tv' ? season : null,
		episode: type === 'tv' ? episode : null,
	};
};
