import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	clampProgress,
	mergeContinueWatchingItems,
	normalizeContinueWatchingItem,
	sanitizeContinueWatchingItems,
	type ContinueWatchingPayload,
} from './continue-watching';

const older = '2026-01-01T00:00:00.000Z';
const newer = '2026-02-01T00:00:00.000Z';

function payload(overrides: Partial<ContinueWatchingPayload> = {}): ContinueWatchingPayload {
	return {
		mediaId: 100,
		mediaType: 'tv',
		progressPercent: 50,
		updatedAt: older,
		createdAt: older,
		...overrides,
	};
}

test('progress is clamped into the 0-100 range', () => {
	assert.equal(clampProgress(-20), 0);
	assert.equal(clampProgress(140), 100);
	assert.equal(clampProgress(40.6), 41);
	assert.equal(clampProgress(Number.NaN), 0);
	assert.equal(clampProgress(undefined), 0);
	assert.equal(clampProgress(null), 0);
});

test('titles without a usable name are dropped or given a fallback', () => {
	assert.equal(normalizeContinueWatchingItem(payload({ mediaType: 'movie', title: null })), null);
	assert.equal(normalizeContinueWatchingItem(payload({ mediaType: 'movie' })), null);
	assert.equal(normalizeContinueWatchingItem(payload({ mediaId: 0 })), null);

	const tv = normalizeContinueWatchingItem(payload({ title: null, showName: null }));
	assert.equal(tv?.title, 'Title 100');

	const named = normalizeContinueWatchingItem(payload({ title: '  Fight Club  ' }));
	assert.equal(named?.title, 'Fight Club');
	assert.equal(named?.id, 'tv:100');
});

test('non-finite episode metadata and progress are normalized', () => {
	const item = normalizeContinueWatchingItem(
		payload({
			seasonNumber: Number.NaN,
			episodeNumber: Number.NaN,
			episodeId: Number.NaN,
			progressPercent: 130,
		})
	);

	assert.equal(item?.seasonNumber, null);
	assert.equal(item?.episodeNumber, null);
	assert.equal(item?.episodeId, null);
	assert.equal(item?.progressPercent, 100);
});

test('merge keeps the newest entry per title and prefers higher progress on ties', () => {
	const staleLocal = mergeContinueWatchingItems(
		[payload({ progressPercent: 70, updatedAt: older, createdAt: older })],
		[payload({ progressPercent: 40, updatedAt: newer, createdAt: older })]
	);
	assert.equal(staleLocal.length, 1);
	assert.equal(staleLocal[0].progressPercent, 40);
	assert.equal(staleLocal[0].updatedAt, newer);

	const tie = mergeContinueWatchingItems(
		[payload({ progressPercent: 70, updatedAt: older, createdAt: older })],
		[payload({ progressPercent: 40, updatedAt: older, createdAt: older })]
	);
	assert.equal(tie.length, 1);
	assert.equal(tie[0].progressPercent, 70);

	const skipped = mergeContinueWatchingItems([payload({ mediaId: 200 })], [payload()]);
	assert.deepEqual(
		skipped.map((item) => item.id),
		['tv:100', 'tv:200']
	);
});

test('sanitize drops out-of-range progress, sorts newest first and limits results', () => {
	const items = sanitizeContinueWatchingItems([
		payload({ mediaId: 1, mediaType: 'tv', progressPercent: 94, updatedAt: older }),
		payload({ mediaId: 2, mediaType: 'tv', progressPercent: 95, updatedAt: newer }),
		payload({ mediaId: 3, mediaType: 'movie', title: 'Movie', progressPercent: 2, updatedAt: newer }),
		payload({ mediaId: 4, mediaType: 'movie', title: 'Movie', progressPercent: 94, updatedAt: newer }),
		payload({ mediaId: 5, mediaType: 'movie', title: 'Movie', progressPercent: 95, updatedAt: older }),
	]);

	assert.deepEqual(
		items.map((item) => item.mediaId),
		[4, 1]
	);

	const filled = Array.from({ length: 30 }, (_, index) =>
		payload({ mediaId: index + 1, updatedAt: `2026-01-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z` })
	);
	assert.equal(sanitizeContinueWatchingItems(filled).length, 24);
});
