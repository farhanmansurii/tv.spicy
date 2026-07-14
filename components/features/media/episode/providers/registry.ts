/**
 * Provider registry — compact data declarations only.
 *
 * To add, hide, or remove an ordinary provider, edit this file and nothing
 * else. Statuses:
 *  'enabled'   — offered in the manual source selector
 *  'candidate' — integrated or researched, hidden pending browser confirmation
 *  'disabled'  — hidden because broken/blocked/retired; reason required
 *
 * HTTP reachability alone does not promote a provider to 'enabled'. Promotion
 * requires a browser check from the application origin (see the checklist in
 * docs/superpowers/specs/2026-07-14-provider-registry-redesign.md), or an
 * explicit product-owner decision to launch with `playback: 'pending'`.
 * Research basis: docs/research/provider-candidates-2026-07-14.md
 */

import type { ProviderDefinition } from './types';
import {
	customEmbedUrls,
	pathEmbedUrls,
	queryResume,
	standardEmbedUrls,
	withQuery,
	encodeSegment as enc,
} from './url-builders';

export const DEFAULT_PROVIDER_ID = 'vidcore';

const VIDKING_QUERY = {
	color: 'ef4444',
	nextEpisode: 'true',
	episodeSelector: 'false',
	autoplay: 'true',
};

export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
	// ── Enabled ──────────────────────────────────────────────────────────────

	{
		id: 'vidcore',
		label: 'VidCore',
		status: 'enabled',
		rank: 1,
		urls: standardEmbedUrls('https://www.vidcore.org'),
		resume: queryResume('startAt'),
		// Docs show a PLAYER_EVENT listener with play/pause/seeked/ended/
		// timeupdate; exact payload capture is still pending browser QA.
		progress: { origin: 'https://www.vidcore.org', adapter: 'vidsrc-family' },
		verification: {
			checkedAt: '2026-07-14',
			// Local check observed intermittent 404 + frame-ancestors 'none'
			// on the TV route alongside 200 responses; watch during browser QA.
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			// Product-owner exception: launched as default before browser
			// playback confirmation.
			playback: 'pending',
		},
	},
	{
		id: 'vidking',
		label: 'Vidking',
		status: 'enabled',
		rank: 16,
		urls: customEmbedUrls(
			'https://www.vidking.net',
			(id) =>
				withQuery(`https://www.vidking.net/embed/movie/${enc(id)}`, VIDKING_QUERY),
			(id, s, e) =>
				withQuery(
					`https://www.vidking.net/embed/tv/${enc(id)}/${enc(s)}/${enc(e)}`,
					VIDKING_QUERY
				)
		),
		progress: { origin: 'https://www.vidking.net', adapter: 'vidking' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'vidlink',
		label: 'VidLink',
		status: 'enabled',
		rank: 3,
		urls: pathEmbedUrls('https://vidlink.pro'),
		resume: queryResume('startAt'),
		progress: { origin: 'https://vidlink.pro', adapter: 'vidlink' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'vidfast',
		label: 'Vidfast',
		status: 'enabled',
		rank: 4,
		// vidfast.net now redirects to vidfast.vc (observed 2026-07-14); embed
		// the final domain directly so the postMessage origin matches.
		urls: pathEmbedUrls('https://vidfast.vc'),
		resume: queryResume('t'),
		progress: { origin: 'https://vidfast.vc', adapter: 'vidsrc-family' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'vidsrc',
		label: 'Vidsrc',
		// vidsrc.pro is an alias of the same family; the direct player domain
		// avoids extra redirects and keeps the postMessage origin stable.
		status: 'enabled',
		rank: 6,
		urls: standardEmbedUrls('https://vidsrc.sbs'),
		progress: { origin: 'https://embed.su', adapter: 'vidsrc-family' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'vidzen',
		label: 'VidZen',
		status: 'enabled',
		rank: 7,
		urls: pathEmbedUrls('https://vidzen.fun'),
		resume: queryResume('startAt'),
		// Unique MEDIA_DATA snapshot model, posted from the backend domain
		progress: { origin: 'https://www.vidsrc.wtf', adapter: 'media-data' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'vidzee',
		label: 'VidZee',
		status: 'enabled',
		rank: 8,
		urls: standardEmbedUrls('https://player.vidzee.wtf'),
		resume: queryResume('startAt'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: '111movies',
		label: '111Movies',
		status: 'enabled',
		rank: 9,
		urls: customEmbedUrls(
			'https://111movies.com',
			(id) => `https://111movies.com/movie/${enc(id)}`,
			(id, s, e) => `https://111movies.com/tv/${enc(id)}/${enc(s)}/${enc(e)}?title=true`
		),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},

	{
		id: 'embedmaster',
		label: 'EmbedMaster',
		status: 'enabled',
		rank: 12,
		// First-party docs at embedmaster.com/documentation/ — no account needed
		// for basic iframe embeds. Own multi-server player, not a VidSrc wrapper.
		// PlayerJS-style postMessage API (not the PLAYER_EVENT family) — no
		// adapter yet; progress falls back to time-based estimation.
		urls: pathEmbedUrls('https://embedmaster.link'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			// Added at product-owner request ahead of local/browser verification.
			playback: 'pending',
		},
	},
	{
		id: 'vidapi',
		label: 'VidAPI',
		status: 'enabled',
		rank: 5,
		// Docs describe startAt/resumeAt and PLAYER_EVENT progress payloads, but
		// also domain whitelisting — confirm third-party framing during browser QA.
		urls: standardEmbedUrls('https://vidapi.ru'),
		resume: queryResume('startAt'),
		progress: { origin: 'https://vidapi.ru', adapter: 'vidsrc-family' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			// Added at product-owner request ahead of local/browser verification.
			playback: 'pending',
		},
	},

	{
		id: 'vidphantom',
		label: 'VidPhantom',
		status: 'enabled',
		rank: 13,
		urls: pathEmbedUrls('https://vidphantom.com'),
		resume: queryResume('startAt'),
		// Documented PLAYER_EVENT/MEDIA_DATA contract appears vidsrc-family
		// compatible, but no browser message has been captured yet.
		progress: { origin: 'https://vidphantom.com', adapter: 'vidsrc-family' },
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'pending',
		},
	},
	{
		id: 'videasy',
		label: 'VidEasy',
		status: 'enabled',
		rank: 10,
		urls: pathEmbedUrls('https://player.videasy.to'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'moviepire',
		label: 'MoviePire',
		status: 'enabled',
		rank: 11,
		urls: standardEmbedUrls('https://video.moviepire.co'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'zxcstream',
		label: 'ZXCStream',
		status: 'enabled',
		rank: 14,
		urls: customEmbedUrls(
			'https://zxcstream.xyz',
			(id) => `https://zxcstream.xyz/player/movie/${enc(id)}`,
			(id, s, e) => `https://zxcstream.xyz/player/tv/${enc(id)}/${enc(s)}/${enc(e)}`
		),
		resume: queryResume('startAt'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'vidnest',
		label: 'Vidnest',
		status: 'enabled',
		rank: 15,
		urls: pathEmbedUrls('https://vidnest.fun'),
		resume: queryResume('startAt'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},
	{
		id: 'cinesrc',
		label: 'CineSrc',
		status: 'enabled',
		rank: 2,
		urls: customEmbedUrls(
			'https://cinesrc.st',
			(id) => `https://cinesrc.st/embed/movie/${enc(id)}`,
			// CineSrc uses a query-based TV route, not path segments
			(id, s, e) => `https://cinesrc.st/embed/tv/${enc(id)}?s=${enc(s)}&e=${enc(e)}`
		),
		resume: queryResume('startAt'),
		verification: {
			checkedAt: '2026-07-14',
			movieRoute: 'reachable',
			tvRoute: 'reachable',
			playback: 'confirmed',
		},
	},

	// ── Disabled (documented but never offered) ──────────────────────────────

	{
		id: 'autoembed',
		label: 'AutoEmbed',
		status: 'disabled',
		rank: 40,
		disabledReason: 'Configured host failed DNS verification on 2026-07-14.',
		urls: standardEmbedUrls('https://player.autoembed.cc'),
		progress: { origin: 'https://player.autoembed.cc', adapter: 'vidsrc-family' },
	},
	{
		id: 'rivestream',
		label: 'Rivestream',
		status: 'disabled',
		rank: 41,
		disabledReason: 'Provider domain failed DNS verification on 2026-07-14.',
		urls: customEmbedUrls(
			'https://rivestream.org',
			(id) => `https://rivestream.org/embed?type=movie&id=${enc(id)}`,
			(id, s, e) =>
				`https://rivestream.org/embed?type=tv&id=${enc(id)}&season=${enc(s)}&episode=${enc(e)}`
		),
	},
	{
		id: 'toustream',
		label: 'TouStream',
		status: 'disabled',
		rank: 42,
		disabledReason: 'Cloudflare response blocks third-party framing (verified 2026-07-14).',
		urls: customEmbedUrls(
			'https://toustream.xyz',
			(id) => `https://toustream.xyz/tou/movies/${enc(id)}`,
			(id, s, e) => `https://toustream.xyz/tou/tv/${enc(id)}/${enc(s)}/${enc(e)}`
		),
		resume: queryResume('startAt'),
	},
];

/**
 * Fail fast on malformed declarations. Throws with every problem listed so a
 * bad edit is caught in development/tests, before it reaches users.
 */
export function validateRegistry(definitions: ProviderDefinition[]): void {
	const problems: string[] = [];
	const ids = new Set<string>();
	const ranks = new Set<number>();

	for (const def of definitions) {
		if (ids.has(def.id)) problems.push(`duplicate id "${def.id}"`);
		ids.add(def.id);

		if (ranks.has(def.rank)) problems.push(`duplicate rank ${def.rank} ("${def.id}")`);
		ranks.add(def.rank);

		if (!/^https:\/\/[^/]+$/.test(def.urls.origin)) {
			problems.push(`"${def.id}" origin must be a bare HTTPS origin, got "${def.urls.origin}"`);
		}
		if (def.status === 'disabled' && !def.disabledReason) {
			problems.push(`disabled provider "${def.id}" is missing disabledReason`);
		}
		if (def.status === 'enabled' && !def.verification) {
			problems.push(`enabled provider "${def.id}" is missing verification metadata`);
		}
		if (def.progress && !/^https:\/\/[^/]+$/.test(def.progress.origin)) {
			problems.push(`"${def.id}" progress origin must be a bare HTTPS origin`);
		}
	}

	if (!definitions.some((d) => d.id === DEFAULT_PROVIDER_ID && d.status === 'enabled')) {
		problems.push(`default provider "${DEFAULT_PROVIDER_ID}" must exist and be enabled`);
	}

	if (problems.length > 0) {
		throw new Error(`Provider registry is invalid:\n - ${problems.join('\n - ')}`);
	}
}
