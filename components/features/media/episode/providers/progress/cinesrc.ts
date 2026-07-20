import { coercePayload, type ProgressAdapter } from './types';

const EVENTS = new Set([
	'cinesrc:timeupdate',
	'cinesrc:pause',
	'cinesrc:seeked',
	'cinesrc:ended',
	'cinesrc:play',
	'cinesrc:loadedmetadata',
]);

export const parseCineSrc: ProgressAdapter = (data, { numericMediaId, type, season, episode }) => {
	const payload = coercePayload(data);
	if (!payload || typeof payload.type !== 'string' || !EVENTS.has(payload.type)) return null;

	const currentTime = Number(payload.currentTime ?? 0);
	const duration = Number(payload.duration ?? 0);
	if (!Number.isFinite(currentTime) || !Number.isFinite(duration)) return null;

	return {
		eventName: payload.type,
		mediaId: numericMediaId,
		currentTime,
		duration,
		progress: duration > 0 ? (currentTime / duration) * 100 : 0,
		season: type === 'tv' ? season : null,
		episode: type === 'tv' ? episode : null,
	};
};
