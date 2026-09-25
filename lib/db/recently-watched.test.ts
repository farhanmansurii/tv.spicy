import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { prisma } from './prisma';
import {
	mergeRecentlyWatchedBatch,
	saveRecentlyWatched,
	updateWatchProgress,
} from './recently-watched';
import type { ContinueWatchingPayload } from '@/lib/continue-watching';

const older = '2026-01-01T00:00:00.000Z';
const newer = '2026-02-01T00:00:00.000Z';

interface Row {
	id: string;
	userId?: string;
	mediaId: number;
	mediaType: 'MOVIE' | 'TV';
	seasonNumber: number | null;
	episodeNumber: number | null;
	episodeId: number | null;
	stillPath: string | null;
	episodeName: string | null;
	showName: string | null;
	progress: number;
	updatedAt: Date;
	watchedAt: Date;
}

function row(overrides: Partial<Row> & Pick<Row, 'id' | 'mediaId'>): Row {
	return {
		userId: 'user-1',
		mediaType: 'TV',
		seasonNumber: null,
		episodeNumber: null,
		episodeId: null,
		stillPath: null,
		episodeName: null,
		showName: 'Show',
		progress: 40,
		updatedAt: new Date(older),
		watchedAt: new Date(older),
		...overrides,
	};
}

const model = prisma.recentlyWatched as unknown as Record<string, unknown>;
const client = prisma as unknown as Record<string, unknown>;
const originalDescriptors = new Map<string, PropertyDescriptor | undefined>();
const originalClientDescriptors = new Map<string, PropertyDescriptor | undefined>();

function stub(
	target: Record<string, unknown>,
 originals: Map<string, PropertyDescriptor | undefined>,
	name: string,
	impl: unknown
) {
	if (!originals.has(name)) {
		originals.set(name, Object.getOwnPropertyDescriptor(target, name));
	}
	Object.defineProperty(target, name, {
		value: impl,
		configurable: true,
		writable: true,
		enumerable: true,
	});
}

function restore(
	target: Record<string, unknown>,
	originals: Map<string, PropertyDescriptor | undefined>
) {
	for (const [name, descriptor] of originals) {
		if (descriptor) {
			Object.defineProperty(target, name, descriptor);
		} else {
			delete target[name];
		}
	}
	originals.clear();
}

function stubTransaction() {
	stub(client, originalClientDescriptors, '$transaction', async (run: (tx: unknown) => unknown) =>
		run({ recentlyWatched: model })
	);
}

afterEach(() => {
	restore(model, originalDescriptors);
	restore(client, originalClientDescriptors);
});

test('invalid payloads return null without touching the database', async () => {
	let calls = 0;
	const count = () => {
		calls += 1;
		return null;
	};

	stub(model, originalDescriptors, 'findFirst', count);
	stub(model, originalDescriptors, 'create', count);
	stub(model, originalDescriptors, 'update', count);
	stub(client, originalClientDescriptors, '$transaction', async () => {
		calls += 1;
		return null;
	});

	assert.equal(await saveRecentlyWatched('user-1', { mediaId: 0, mediaType: 'movie' }), null);
	assert.equal(
		await saveRecentlyWatched('user-1', { mediaType: 'tv' } as unknown as ContinueWatchingPayload),
		null
	);
	assert.equal(calls, 0);
});

test('saving an existing title updates the row and clamps progress', async () => {
	const existing = row({ id: 'r1', mediaId: 100 });
	let created = 0;
	let updateData: Record<string, unknown> | undefined;

	stub(model, originalDescriptors, 'findFirst', async () => existing);
	stub(model, originalDescriptors, 'create', async () => {
		created += 1;
		return existing;
	});
	stub(model, originalDescriptors, 'update', async (args: { data: Record<string, unknown> }) => {
		updateData = args.data;
		return { ...existing, ...args.data };
	});
	stubTransaction();

	const saved = await saveRecentlyWatched('user-1', {
		mediaId: 100,
		mediaType: 'tv',
		progressPercent: 150,
		seasonNumber: 2,
		episodeNumber: 7,
		updatedAt: newer,
	});

	assert.equal(created, 0);
	assert.equal(updateData?.['progress'], 100);
	assert.equal(updateData?.['seasonNumber'], 2);
	assert.equal(updateData?.['episodeNumber'], 7);
	assert.ok(updateData?.['updatedAt'] instanceof Date);
	assert.equal(saved?.id, 'tv:100');
	assert.equal(saved?.progressPercent, 100);
});

test('saving a new title creates a row with clamped progress', async () => {
	let created: Record<string, unknown> | undefined;

	stub(model, originalDescriptors, 'findFirst', async () => null);
	stub(model, originalDescriptors, 'update', async () => {
		throw new Error('update should not run for a new title');
	});
	stub(model, originalDescriptors, 'create', async (args: { data: Record<string, unknown> }) => {
		created = args.data;
		return { id: 'r9', ...args.data } as unknown as Row;
	});
	stubTransaction();

	const saved = await saveRecentlyWatched('user-1', {
		mediaId: 200,
		mediaType: 'movie',
		title: 'Fight Club',
		progressPercent: -10,
		createdAt: older,
	});

	assert.equal(created?.['progress'], 0);
	assert.equal(created?.['mediaType'], 'MOVIE');
	assert.ok(created?.['updatedAt'] instanceof Date);
	assert.equal(saved?.id, 'movie:200');
});

test('batch merge persists newer progress and never deletes rows it dropped', async () => {
	const deleted: string[] = [];
	const store: Row[] = [
		row({ id: 'r1', mediaId: 100, progress: 40 }),
		// Past the display cut-off, yet persistence must keep it: only an explicit
		// delete request may remove a row, never a merge.
		row({ id: 'r2', mediaId: 200, progress: 96 }),
	];
	let updated = 0;

	stub(model, originalDescriptors, 'findMany', async () =>
		store.filter((entry) => !deleted.includes(entry.id))
	);
	stub(model, originalDescriptors, 'findFirst', async (args: { where: { mediaId: number } }) =>
		store.find((entry) => entry.mediaId === args.where.mediaId) ?? null
	);
	stub(model, originalDescriptors, 'create', async () => {
		throw new Error('both titles already exist');
	});
	stub(model, originalDescriptors, 'update', async (args: { where: { id: string }; data: Record<string, unknown> }) => {
		const index = store.findIndex((entry) => entry.id === args.where.id);
		updated += 1;
		store[index] = { ...store[index], ...args.data } as Row;
		return store[index];
	});
	stub(model, originalDescriptors, 'deleteMany', async (args: { where: { id: { in: string[] } } }) => {
		deleted.push(...args.where.id.in);
		return { count: args.where.id.in.length };
	});
	stubTransaction();

	const incoming: ContinueWatchingPayload = {
		mediaId: 100,
		mediaType: 'tv',
		progressPercent: 80,
		updatedAt: newer,
		createdAt: older,
	};
	const mergedCount = await mergeRecentlyWatchedBatch('user-1', [incoming]);

	assert.equal(updated, 1);
	assert.deepEqual(deleted, []);
	assert.equal(store.find((entry) => entry.id === 'r2')?.progress, 96);
	assert.equal(store.find((entry) => entry.mediaId === 100)?.progress, 80);
	assert.equal(mergedCount, 2);
});

test('progress updates clamp the value and report missing rows', async () => {
	stub(model, originalDescriptors, 'findFirst', async () => null);
	assert.equal(await updateWatchProgress('user-1', 100, 90), null);

	const existing = row({ id: 'r1', mediaId: 100 });
	let updateData: Record<string, unknown> | undefined;
	restore(model, originalDescriptors);
	stub(model, originalDescriptors, 'findFirst', async () => existing);
	stub(model, originalDescriptors, 'update', async (args: { data: Record<string, unknown> }) => {
		updateData = args.data;
		return { ...existing, ...args.data };
	});

	const updated = await updateWatchProgress('user-1', 100, 400, 'tv', 3, 9);
	assert.equal(updateData?.['progress'], 100);
	assert.equal(updateData?.['seasonNumber'], 3);
	assert.equal(updated?.progressPercent, 100);
	assert.equal(updated?.id, 'tv:100');
});
