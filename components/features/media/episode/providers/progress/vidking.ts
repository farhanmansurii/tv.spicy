/**
 * Vidking PLAYER_EVENT adapter. Distinctives vs the other families:
 *  • ID field: `id`
 *  • Ships a pre-computed `progress` field
 *  • Includes season/episode in TV events
 */

import { playerEventData, type ProgressAdapter } from './types';

const EVENTS = ['timeupdate', 'pause', 'seeked', 'ended', 'play'];

export const parseVidking: ProgressAdapter = (data, { id, numericMediaId, type, season, episode }) => {
	const evt = playerEventData(data);
	if (!evt) return null;

	const eventName = String(evt.event ?? '');
	if (!EVENTS.includes(eventName)) return null;

	const messageMediaId = Number(evt.id ?? id);
	if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) return null;

	return {
		eventName,
		mediaId: messageMediaId,
		currentTime: Number(evt.currentTime ?? 0),
		duration: Number(evt.duration ?? 0),
		progress: Number(evt.progress ?? 0),
		season: type === 'tv' ? Number(evt.season ?? season) : null,
		episode: type === 'tv' ? Number(evt.episode ?? episode) : null,
	};
};
