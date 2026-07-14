/**
 * Progress adapter contracts. An adapter turns one provider family's raw
 * postMessage payload into a normalized progress event, or null to ignore it.
 * Origin filtering happens before the adapter runs (see use-playback-progress).
 */

export interface ParsedProgressEvent {
	eventName: string;
	mediaId: number;
	currentTime: number;
	duration: number;
	progress: number;
	season: number | null;
	episode: number | null;
}

export interface ProgressContext {
	id: string;
	numericMediaId: number;
	type: string;
	season: number;
	episode: number;
}

export type ProgressAdapter = (data: unknown, context: ProgressContext) => ParsedProgressEvent | null;

export type ProgressAdapterId = 'vidking' | 'vidlink' | 'vidsrc-family' | 'media-data';

/** Parse a payload that may arrive as a JSON string or an object. */
export function coercePayload(data: unknown): Record<string, unknown> | null {
	let payload = data;
	if (typeof payload === 'string') {
		try {
			payload = JSON.parse(payload);
		} catch {
			return null;
		}
	}
	if (!payload || typeof payload !== 'object') return null;
	return payload as Record<string, unknown>;
}

/** Extract the `data` object of a `PLAYER_EVENT` envelope, or null. */
export function playerEventData(data: unknown): Record<string, unknown> | null {
	const payload = coercePayload(data);
	if (!payload || payload.type !== 'PLAYER_EVENT') return null;
	const evt = payload.data;
	if (!evt || typeof evt !== 'object') return null;
	return evt as Record<string, unknown>;
}
