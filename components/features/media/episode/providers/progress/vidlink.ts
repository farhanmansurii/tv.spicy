/**
 * VidLink PLAYER_EVENT adapter. Same envelope as Vidking but:
 *  • ID field: `mtmdbId`
 *  • No pre-computed progress — derived from currentTime / duration
 */

import { playerEventData, type ProgressAdapter } from './types';

const EVENTS = ['timeupdate', 'pause', 'seeked', 'ended', 'play'];

export const parseVidlink: ProgressAdapter = (data, { numericMediaId, type, season, episode }) => {
	const evt = playerEventData(data);
	if (!evt) return null;

	const eventName = String(evt.event ?? '');
	if (!EVENTS.includes(eventName)) return null;

	const messageMediaId = Number(evt.mtmdbId ?? 0);
	if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) return null;

	const currentTime = Number(evt.currentTime ?? 0);
	const duration = Number(evt.duration ?? 0);

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
