/**
 * Provider module tests. Run with:
 *   npx tsx --test components/features/media/episode/providers/providers.test.ts
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	buildProviderUrl,
	DEFAULT_PROVIDER_ID,
	listEnabledProviders,
	PROGRESS_ADAPTERS,
	resolveProvider,
} from './index';
import { PROVIDER_DEFINITIONS, validateRegistry } from './registry';
import { buildUrl, queryResume, standardEmbedUrls, withQuery } from './url-builders';
import type { ProviderDefinition } from './types';

const movie = { type: 'movie' as const, id: '27205' };
const tv = { type: 'tv' as const, id: '1399', seasonNumber: 1, episodeNumber: 1 };

// ── Registry validation ──────────────────────────────────────────────────────

test('current registry is valid', () => {
	validateRegistry(PROVIDER_DEFINITIONS);
});

function def(overrides: Partial<ProviderDefinition>): ProviderDefinition {
	return {
		id: 'x',
		label: 'X',
		status: 'candidate',
		rank: 99,
		urls: standardEmbedUrls('https://example.com'),
		...overrides,
	};
}

test('validation rejects duplicate ids', () => {
	assert.throws(
		() => validateRegistry([...PROVIDER_DEFINITIONS, def({ id: 'vidfast', rank: 999 })]),
		/duplicate id/
	);
});

test('validation rejects duplicate ranks', () => {
	assert.throws(
		() => validateRegistry([...PROVIDER_DEFINITIONS, def({ rank: 1 })]),
		/duplicate rank/
	);
});

test('validation rejects disabled providers without a reason', () => {
	assert.throws(
		() => validateRegistry([...PROVIDER_DEFINITIONS, def({ status: 'disabled' })]),
		/disabledReason/
	);
});

test('validation rejects non-HTTPS or non-bare origins', () => {
	assert.throws(
		() =>
			validateRegistry([
				...PROVIDER_DEFINITIONS,
				def({ urls: standardEmbedUrls('http://example.com') }),
			]),
		/HTTPS origin/
	);
	assert.throws(
		() =>
			validateRegistry([
				...PROVIDER_DEFINITIONS,
				def({ urls: standardEmbedUrls('https://example.com/embed') }),
			]),
		/HTTPS origin/
	);
});

test('validation rejects enabled providers without verification', () => {
	assert.throws(
		() => validateRegistry([...PROVIDER_DEFINITIONS, def({ status: 'enabled' })]),
		/verification/
	);
});

// ── Selector list ────────────────────────────────────────────────────────────

test('enabled providers are rank-sorted with Vidfast first', () => {
	const list = listEnabledProviders();
	assert.equal(list[0].id, 'vidfast');
	assert.deepEqual(
		list.map((p) => p.id),
		[
			'vidfast',
			'cinesrc',
			'vidlink',
			'vidapi',
			'vidzee',
			'videasy',
			'embedmaster',
			'zxcstream',
			'vidking',
		]
	);
});

test('candidate and disabled providers never appear in selector results', () => {
	const visible = new Set(listEnabledProviders().map((p) => p.id));
	for (const d of PROVIDER_DEFINITIONS) {
		if (d.status !== 'enabled') assert.ok(!visible.has(d.id), `${d.id} should be hidden`);
	}
});

// ── Resolution ───────────────────────────────────────────────────────────────

test('unknown and disabled ids resolve to the default', () => {
	assert.equal(DEFAULT_PROVIDER_ID, 'vidfast');
	for (const id of ['nope', 'rivestream', 'toustream', '']) {
		assert.equal(resolveProvider(id).id, 'vidfast');
	}
	assert.equal(resolveProvider('vidking').id, 'vidking');
});

// ── URL building ─────────────────────────────────────────────────────────────

test('movie and tv builders encode identifiers', () => {
	assert.equal(
		buildProviderUrl('vidlink', { type: 'movie', id: 'a/b?c' }),
		'https://vidlink.pro/movie/a%2Fb%3Fc'
	);
});

test('videasy uses the direct player routes', () => {
	assert.equal(
		buildProviderUrl('videasy', { type: 'movie', id: '1368337' }),
		'https://player.videasy.to/movie/1368337'
	);
	assert.equal(
		buildProviderUrl('videasy', tv),
		'https://player.videasy.to/tv/1399/1/1'
	);
});

test('cinesrc keeps its query-based tv route and resume composes with it', () => {
	const cinesrc = PROVIDER_DEFINITIONS.find((d) => d.id === 'cinesrc')!;
	assert.equal(
		buildUrl(cinesrc.urls, cinesrc.resume, tv),
		'https://cinesrc.st/embed/tv/1399?s=1&e=1'
	);
	assert.equal(
		buildUrl(cinesrc.urls, cinesrc.resume, { ...tv, resumeSeconds: 61 }),
		'https://cinesrc.st/embed/tv/1399?s=1&e=1&startAt=61'
	);
});

test('resume is omitted at zero and floored otherwise', () => {
	const urls = standardEmbedUrls('https://example.com');
	const resume = queryResume('startAt');
	assert.equal(
		buildUrl(urls, resume, { ...movie, resumeSeconds: 0 }),
		'https://example.com/embed/movie/27205'
	);
	assert.equal(
		buildUrl(urls, resume, { ...movie, resumeSeconds: 12.7 }),
		'https://example.com/embed/movie/27205?startAt=12'
	);
});

test('tv urls require positive season and episode', () => {
	for (const bad of [
		{ ...tv, seasonNumber: 0 },
		{ ...tv, episodeNumber: -1 },
		{ ...tv, seasonNumber: undefined },
	]) {
		assert.throws(() => buildProviderUrl('cinesrc', bad), /season\/episode/);
	}
	assert.throws(() => buildProviderUrl('cinesrc', { type: 'movie', id: '' }), /media id/);
});

test('withQuery composes with existing query strings', () => {
	assert.equal(withQuery('https://x.test/a?b=1', { c: '2' }), 'https://x.test/a?b=1&c=2');
});

// ── Progress adapters ────────────────────────────────────────────────────────

const ctx = { id: '1399', numericMediaId: 1399, type: 'tv', season: 1, episode: 2 };

test('adapters reject malformed payloads and wrong media ids', () => {
	for (const adapter of Object.values(PROGRESS_ADAPTERS)) {
		assert.equal(adapter('not json {', ctx), null);
		assert.equal(adapter(null, ctx), null);
		assert.equal(adapter({ type: 'OTHER' }, ctx), null);
	}
	assert.equal(
		PROGRESS_ADAPTERS.vidking(
			{
				type: 'PLAYER_EVENT',
				data: { event: 'timeupdate', id: 999, currentTime: 5, duration: 10 },
			},
			ctx
		),
		null
	);
});

test('vidking adapter parses its native payload', () => {
	const parsed = PROGRESS_ADAPTERS.vidking(
		{
			type: 'PLAYER_EVENT',
			data: {
				event: 'timeupdate',
				id: 1399,
				currentTime: 30,
				duration: 60,
				progress: 50,
				season: 1,
				episode: 2,
			},
		},
		ctx
	);
	assert.deepEqual(parsed, {
		eventName: 'timeupdate',
		mediaId: 1399,
		currentTime: 30,
		duration: 60,
		progress: 50,
		season: 1,
		episode: 2,
	});
});

test('vidlink adapter reads mtmdbId and derives progress', () => {
	const parsed = PROGRESS_ADAPTERS.vidlink(
		{
			type: 'PLAYER_EVENT',
			data: { event: 'pause', mtmdbId: 1399, currentTime: 30, duration: 120 },
		},
		ctx
	);
	assert.equal(parsed?.progress, 25);
	assert.equal(parsed?.season, 1);
});

test('vidsrc-family adapter accepts both event vocabularies', () => {
	const time = PROGRESS_ADAPTERS['vidsrc-family'](
		JSON.stringify({
			type: 'PLAYER_EVENT',
			data: { event: 'time', tmdbId: 1399, currentTime: 10, duration: 100 },
		}),
		ctx
	);
	assert.equal(time?.eventName, 'timeupdate');
	const ended = PROGRESS_ADAPTERS['vidsrc-family'](
		{
			type: 'PLAYER_EVENT',
			data: { event: 'complete', tmdbId: 1399, currentTime: 100, duration: 100 },
		},
		ctx
	);
	assert.equal(ended?.eventName, 'ended');
	const standard = PROGRESS_ADAPTERS['vidsrc-family'](
		{
			type: 'PLAYER_EVENT',
			data: { event: 'timeupdate', tmdbId: 1399, currentTime: 1, duration: 2 },
		},
		ctx
	);
	assert.equal(standard?.eventName, 'timeupdate');
});
