/**
 * Provider registry — add new providers here, nothing else needs to change.
 *
 * Each entry describes:
 *  - how to build the embed URL (with optional resume-time injection)
 *  - whether the provider sends postMessage progress events and how to parse them
 *
 * Progress tracking tiers:
 *  'postMessage' — provider emits accurate playback events via window.postMessage
 *  'time-based'  — fallback: wall-clock estimation using known duration from the store
 */

export interface ProviderUrlParams {
	type: 'movie' | 'tv';
	id: string;
	seasonNumber: number;
	episodeNumber: number;
	/** Seconds to resume from. 0 means start from the beginning. */
	resumeSeconds: number;
}

export interface ParsedProgressEvent {
	eventName: string;
	mediaId: number;
	currentTime: number;
	duration: number;
	progress: number;
	season: number | null;
	episode: number | null;
}

export interface ProviderConfig {
	name: string;
	label: string;
	buildUrl: (params: ProviderUrlParams) => string;
	/**
	 * If set, this provider sends postMessage progress events from this exact origin.
	 * The hook will only process messages matching this origin.
	 */
	postMessageOrigin?: string;
	/**
	 * Parse a raw postMessage payload from this provider into a normalized progress
	 * event. Return null to ignore the message.
	 */
	parseProgressMessage?: (
		data: unknown,
		context: {
			id: string;
			numericMediaId: number;
			type: string;
			season: number;
			episode: number;
		}
	) => ParsedProgressEvent | null;
}

// ---------------------------------------------------------------------------
// Shared URL helpers
// ---------------------------------------------------------------------------

function embedUrl(domain: string, params: ProviderUrlParams): string {
	const { type, id, seasonNumber, episodeNumber } = params;
	const safeId = encodeURIComponent(id);
	return type === 'movie'
		? `https://${domain}/embed/movie/${safeId}`
		: `https://${domain}/embed/tv/${safeId}/${encodeURIComponent(String(seasonNumber))}/${encodeURIComponent(String(episodeNumber))}`;
}

function appendResume(url: string, seconds: number, param: string): string {
	if (seconds <= 0) return url;
	const separator = url.includes('?') ? '&' : '?';
	// add 2980B9 as ?theme=2980B9"
	return `${url}${separator}${param}=${seconds}&theme=2980B9`;
}

// ---------------------------------------------------------------------------
// Shared parsers
// ---------------------------------------------------------------------------

/**
 * Parser shared by embed.su, vidsrc.pro (alias), and autoembed.cc — all use
 * the VidSrc-family PLAYER_EVENT format with these quirks vs Vidking/VidLink:
 *  • ID field : `tmdbId`  (not `id` or `mtmdbId`)
 *  • "time"   : equivalent to "timeupdate"
 *  • "complete": equivalent to "ended"
 *  • No pre-computed progress — derived from currentTime / duration
 */
function parseSuFamily(
	data: unknown,
	context: {
		id: string;
		numericMediaId: number;
		type: string;
		season: number;
		episode: number;
	}
): ParsedProgressEvent | null {
	const { numericMediaId, type, season, episode } = context;

	let payload = data;
	if (typeof payload === 'string') {
		try {
			payload = JSON.parse(payload);
		} catch {
			return null;
		}
	}
	if (
		!payload ||
		typeof payload !== 'object' ||
		(payload as Record<string, unknown>).type !== 'PLAYER_EVENT'
	) {
		return null;
	}
	const evt = (payload as { data?: Record<string, unknown> }).data;
	if (!evt) return null;

	const rawEvent = String(evt.event ?? '');
	if (!['play', 'pause', 'time', 'complete'].includes(rawEvent)) return null;

	const messageMediaId = Number(evt.tmdbId ?? 0);
	if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) return null;

	const currentTime = Number(evt.currentTime ?? 0);
	const duration = Number(evt.duration ?? 0);

	// Normalise event names to the same vocabulary the hook uses for debouncing
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
}

// ---------------------------------------------------------------------------
// Provider registry
// ---------------------------------------------------------------------------

export const PROVIDERS: ProviderConfig[] = [
	// ── Vidfast ──────────────────────────────────────────────────────────────
	// Emits PLAYER_EVENT postMessage — same envelope as Vidking/VidLink but
	// uses `tmdbId` for the media ID. Does not include season/episode in events
	// so those fall back to the values passed in context.
	// Resume param is `?t=<seconds>` (confirmed from community docs).
	{
		name: 'vidfast',
		label: 'Vidfast',
		buildUrl({ type, id, seasonNumber, episodeNumber, resumeSeconds }) {
			const base =
				type === 'movie'
					? `https://vidfast.net/movie/${id}`
					: `https://vidfast.net/tv/${id}/${seasonNumber}/${episodeNumber}`;
			return appendResume(base, resumeSeconds, 't');
		},
		postMessageOrigin: 'https://vidfast.net',
		parseProgressMessage(data, { numericMediaId, type, season, episode }) {
			let payload = data;
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload);
				} catch {
					return null;
				}
			}
			if (
				!payload ||
				typeof payload !== 'object' ||
				(payload as Record<string, unknown>).type !== 'PLAYER_EVENT'
			) {
				return null;
			}
			const evt = (payload as { data?: Record<string, unknown> }).data;
			if (!evt) return null;

			const eventName = String(evt.event ?? '');
			if (!['timeupdate', 'pause', 'seeked', 'ended', 'play'].includes(eventName))
				return null;

			// Vidfast sends `tmdbId` — different from Vidking (`id`) and VidLink (`mtmdbId`)
			const messageMediaId = Number(evt.tmdbId ?? 0);
			if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) return null;

			const currentTime = Number(evt.currentTime ?? 0);
			const duration = Number(evt.duration ?? 0);

			return {
				eventName,
				mediaId: messageMediaId,
				currentTime,
				duration,
				// Vidfast doesn't send a pre-computed progress field; derive it
				progress: duration > 0 ? (currentTime / duration) * 100 : 0,
				// Vidfast events don't include season/episode — use context values
				season: type === 'tv' ? season : null,
				episode: type === 'tv' ? episode : null,
			};
		},
	},

	// ── Vidking ──────────────────────────────────────────────────────────────
	// Most accurate: emits postMessage PLAYER_EVENT with currentTime, duration,
	// progress, and episode metadata. Treated as the source of truth.
	{
		name: 'vidking',
		label: 'Vidking',
		buildUrl({ type, id, seasonNumber, episodeNumber }) {
			const base =
				type === 'movie'
					? `https://www.vidking.net/embed/movie/${encodeURIComponent(id)}`
					: `https://www.vidking.net/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(String(seasonNumber))}/${encodeURIComponent(String(episodeNumber))}`;
			const qs = new URLSearchParams({
				color: 'ef4444',
				nextEpisode: 'true',
				episodeSelector: 'false',
				autoplay: 'true',
			});
			return `${base}?${qs.toString()}`;
		},
		postMessageOrigin: 'https://www.vidking.net',
		parseProgressMessage(data, { id, numericMediaId, type, season, episode }) {
			let payload = data;
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload);
				} catch {
					return null;
				}
			}
			if (
				!payload ||
				typeof payload !== 'object' ||
				(payload as Record<string, unknown>).type !== 'PLAYER_EVENT'
			) {
				return null;
			}
			const evt = (payload as { data?: Record<string, unknown> }).data;
			if (!evt) return null;

			const eventName = String(evt.event ?? '');
			if (!['timeupdate', 'pause', 'seeked', 'ended', 'play'].includes(eventName))
				return null;

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
		},
	},

	// ── VidLink ──────────────────────────────────────────────────────────────
	// Supports ?startAt=<seconds> for resume.
	// Emits PLAYER_EVENT postMessage — same structure as Vidking but uses
	// `mtmdbId` for the media ID and `mediaType` for movie/tv distinction.
	{
		name: 'vidlink',
		label: 'VidLink',
		buildUrl({ type, id, seasonNumber, episodeNumber, resumeSeconds }) {
			const base =
				type === 'movie'
					? `https://vidlink.pro/movie/${id}`
					: `https://vidlink.pro/tv/${id}/${seasonNumber}/${episodeNumber}`;
			return appendResume(base, resumeSeconds, 'startAt');
		},
		postMessageOrigin: 'https://vidlink.pro',
		parseProgressMessage(data, { numericMediaId, type, season, episode }) {
			let payload = data;
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload);
				} catch {
					return null;
				}
			}
			if (
				!payload ||
				typeof payload !== 'object' ||
				(payload as Record<string, unknown>).type !== 'PLAYER_EVENT'
			) {
				return null;
			}
			const evt = (payload as { data?: Record<string, unknown> }).data;
			if (!evt) return null;

			const eventName = String(evt.event ?? '');
			if (!['timeupdate', 'pause', 'seeked', 'ended', 'play'].includes(eventName))
				return null;

			// VidLink sends `mtmdbId` — not `id`
			const messageMediaId = Number(evt.mtmdbId ?? 0);
			if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) return null;

			const currentTime = Number(evt.currentTime ?? 0);
			const duration = Number(evt.duration ?? 0);

			return {
				eventName,
				mediaId: messageMediaId,
				currentTime,
				duration,
				// VidLink doesn't send a pre-computed progress field; derive it
				progress: duration > 0 ? (currentTime / duration) * 100 : 0,
				season: type === 'tv' ? Number(evt.season ?? season) : null,
				episode: type === 'tv' ? Number(evt.episode ?? episode) : null,
			};
		},
	},

	// ── Embed.su / Vidsrc ────────────────────────────────────────────────────
	// vidsrc.pro 301-redirects to embed.su — they are the same service.
	// Both use the VidSrc-family PLAYER_EVENT format but with different event
	// names: "time" (not "timeupdate") and "complete" (not "ended").
	// postMessage origin is always https://embed.su regardless of which URL was
	// loaded, because the browser resolves the redirect before the iframe loads.
	{
		name: 'embed.su',
		label: 'Embed SU',
		buildUrl(params) {
			return embedUrl('embed.su', params);
		},
		postMessageOrigin: 'https://embed.su',
		parseProgressMessage: parseSuFamily,
	},

	// vidsrc.pro is just an alias — keep it as a separate selectable provider
	// so users who prefer the label see it, but wiring is identical to embed.su.
	{
		name: 'vidsrc',
		label: 'Vidsrc',
		buildUrl(params) {
			// vidsrc.pro → embed.su redirect; use embed.su directly to avoid the
			// extra round-trip and ensure postMessage origin matches.
			return embedUrl('embed.su', params);
		},
		postMessageOrigin: 'https://embed.su',
		parseProgressMessage: parseSuFamily,
	},

	// ── AutoEmbed ────────────────────────────────────────────────────────────
	// Uses the same VidSrc-family PLAYER_EVENT format (tmdbId, "time"/"complete"
	// event names). Origin is player.autoembed.cc — the actual frame domain.
	{
		name: 'autoembed',
		label: 'AutoEmbed',
		buildUrl({ type, id, seasonNumber, episodeNumber }) {
			return type === 'movie'
				? `https://player.autoembed.cc/embed/movie/${id}`
				: `https://player.autoembed.cc/embed/tv/${id}/${seasonNumber}/${episodeNumber}`;
		},
		postMessageOrigin: 'https://player.autoembed.cc',
		parseProgressMessage: parseSuFamily,
	},

	// ── Rivestream ───────────────────────────────────────────────────────────
	// No postMessage API documented — falls back to time-based estimation.
	{
		name: 'rivestream',
		label: 'Rivestream',
		buildUrl({ type, id, seasonNumber, episodeNumber }) {
			return type === 'movie'
				? `https://rivestream.org/embed?type=movie&id=${encodeURIComponent(id)}`
				: `https://rivestream.org/embed?type=tv&id=${encodeURIComponent(id)}&season=${encodeURIComponent(String(seasonNumber))}&episode=${encodeURIComponent(String(episodeNumber))}`;
		},
	},

	// ── VidEasy ──────────────────────────────────────────────────────────────
	// No postMessage API documented — falls back to time-based estimation.
	{
		name: 'videasy',
		label: 'VidEasy',
		buildUrl({ type, id, seasonNumber, episodeNumber }) {
			return type === 'movie'
				? `https://player.videasy.net/movie/${id}`
				: `https://player.videasy.net/tv/${id}/${seasonNumber}/${episodeNumber}`;
		},
	},

	// ── Vidstream (vidzen.fun) ────────────────────────────────────────────────
	// Docs: https://vidzen.fun (see VidZen PDF)
	//
	// Unique event model — completely different from the other providers:
	//  • Event type  : MEDIA_DATA  (not PLAYER_EVENT)
	//  • Origin      : https://www.vidsrc.wtf  (backend domain, not vidzen.fun)
	//  • Data shape  : keyed by TMDB ID string; uses `watched`/`duration` fields
	//  • TV shows    : per-episode progress in `show_progress["s{N}e{N}"]`
	//  • Resume param: ?startAt=<seconds>
	{
		name: 'vidzen',
		label: 'VidZen',
		buildUrl({ type, id, seasonNumber, episodeNumber, resumeSeconds }) {
			const base =
				type === 'movie'
					? `https://vidzen.fun/movie/${id}`
					: `https://vidzen.fun/tv/${id}/${seasonNumber}/${episodeNumber}`;
			return appendResume(base, resumeSeconds, 'startAt');
		},
		postMessageOrigin: 'https://www.vidsrc.wtf',
		parseProgressMessage(data, { numericMediaId, type, season, episode }) {
			let payload = data;
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload);
				} catch {
					return null;
				}
			}
			if (
				!payload ||
				typeof payload !== 'object' ||
				(payload as Record<string, unknown>).type !== 'MEDIA_DATA'
			) {
				return null;
			}

			// MEDIA_DATA ships the entire progress store keyed by media ID string
			const store = (payload as { data?: Record<string, unknown> }).data;
			if (!store) return null;

			const entry = store[String(numericMediaId)] as Record<string, unknown> | undefined;
			if (!entry) return null;

			let currentTime: number;
			let duration: number;

			if (type === 'tv' && season > 0 && episode > 0) {
				// Prefer episode-specific progress when available
				const epKey = `s${season}e${episode}`;
				const showProgress = entry.show_progress as Record<string, unknown> | undefined;
				const epEntry = showProgress?.[epKey] as Record<string, unknown> | undefined;
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
		},
	},

	// ── 111Movies ────────────────────────────────────────────────────────────
	// No postMessage API documented — falls back to time-based estimation.
	{
		name: '111movies',
		label: '111Movies',
		buildUrl({ type, id, seasonNumber, episodeNumber }) {
			return type === 'movie'
				? `https://111movies.com/movie/${id}`
				: `https://111movies.com/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`;
		},
	},
];

/** Look up a provider by name. Falls back to the first provider. */
export function getProvider(name: string): ProviderConfig {
	return PROVIDERS.find((p) => p.name === name) ?? PROVIDERS[0];
}
