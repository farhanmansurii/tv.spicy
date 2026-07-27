import assert from 'node:assert/strict';
import { test } from 'node:test';

import { WriteCoordinator } from './write-coordinator';

test('frequent writes persist at most once per interval and keep the latest checkpoint', async () => {
	let now = 0;
	const writes: string[] = [];
	const coordinator = new WriteCoordinator({
		intervalMs: 60_000,
		now: () => now,
	});

	await coordinator.schedule('tv:1', '10', async () => {
		writes.push('10');
	});

	now = 10_000;
	await coordinator.schedule('tv:1', '20', async () => {
		writes.push('20');
	});
	now = 30_000;
	await coordinator.schedule('tv:1', '30', async () => {
		writes.push('30');
	});

	assert.deepEqual(writes, ['10']);

	now = 60_000;
	await coordinator.schedule('tv:1', '40', async () => {
		writes.push('40');
	});

	assert.deepEqual(writes, ['10', '40']);
});

test('flush persists the newest pending checkpoint once and duplicate fingerprints are ignored', async () => {
	let now = 0;
	const writes: string[] = [];
	const coordinator = new WriteCoordinator({
		intervalMs: 60_000,
		now: () => now,
	});

	await coordinator.schedule('movie:2', '1', async () => {
		writes.push('1');
	});

	now = 5_000;
	await coordinator.schedule('movie:2', '2', async () => {
		writes.push('2');
	});
	await coordinator.schedule('movie:2', '2', async () => {
		writes.push('duplicate');
	});
	await coordinator.flush('movie:2');
	await coordinator.flush('movie:2');

	assert.deepEqual(writes, ['1', '2']);
});

test('concurrent flushes serialize behind an in-flight write', async () => {
	const writes: string[] = [];
	let releaseFirstWrite: (() => void) | undefined;
	const firstWriteGate = new Promise<void>((resolve) => {
		releaseFirstWrite = resolve;
	});
	const coordinator = new WriteCoordinator({ intervalMs: 60_000 });

	const firstWrite = coordinator.schedule('tv:3', '1', async () => {
		writes.push('1');
		await firstWriteGate;
	});
	const pendingWrite = coordinator.schedule('tv:3', '2', async () => {
		writes.push('2');
	});
	const firstFlush = coordinator.flush('tv:3');
	const secondFlush = coordinator.flush('tv:3');

	releaseFirstWrite?.();
	await Promise.all([firstWrite, pendingWrite, firstFlush, secondFlush]);

	assert.deepEqual(writes, ['1', '2']);
});
