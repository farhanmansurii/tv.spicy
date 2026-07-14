/**
 * Adapter for the VidSrc-family PLAYER_EVENT format shared by Vidfast,
 * Vidsrc/embed.su/autoembed, VidCore, and (per its docs) VidPhantom:
 *  • ID field: `tmdbId`
 *  • Event vocabulary varies — some emit "time"/"complete" instead of
 *    "timeupdate"/"ended"; both are accepted and normalized
 *  • No pre-computed progress — derived from currentTime / duration
 *  • season/episode may be absent from events; context values fill in
 */

import { playerEventData, type ProgressAdapter } from './types';

const EVENTS = ['timeupdate', 'pause', 'seeked', 'ended', 'play', 'time', 'complete'];

export const parseVidsrcFamily: ProgressAdapter = (data, { numericMediaId, type, season, episode }) => {
	const evt = playerEventData(data);
	if (!evt) return null;

	const rawEvent = String(evt.event ?? '');
	if (!EVENTS.includes(rawEvent)) return null;

	const messageMediaId = Number(evt.tmdbId ?? 0);
	if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) return null;

	const currentTime = Number(evt.currentTime ?? 0);
	const duration = Number(evt.duration ?? 0);

	// Normalize to the vocabulary the hook uses for debouncing
	const eventName =
		rawEvent === 'time' ? 'timeupdate' : rawEvent === 'complete' ? 'ended' : rawEvent;

	return {
		eventName,
		mediaId: messageMediaId,
		currentTime,
		duration,
		progress: duration > 0 ? (currentTime / duration) * 100 : 0,
		season: type === 'tv' ? Number(evt.season ?? season) : null,
		episode: type === 'tv' ? Number(evt.episode ?? episode) : null,
	};
};
