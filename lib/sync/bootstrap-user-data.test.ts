import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { bootstrapUserData, resetUserBootstrap } from './bootstrap-user-data';

afterEach(() => {
	resetUserBootstrap();
});

test('anonymous bootstrap performs no collection or request', async () => {
	let collections = 0;
	let requests = 0;

	const result = await bootstrapUserData(null, {
		collectLocalData: async () => {
			collections += 1;
			return {};
		},
		request: async () => {
			requests += 1;
			return { marker: 'unexpected' };
		},
	});

	assert.equal(result, null);
	assert.equal(collections, 0);
	assert.equal(requests, 0);
});

test('concurrent and repeated bootstrap calls collapse to one request per user session', async () => {
	let collections = 0;
	let requests = 0;
	let releaseRequest: (() => void) | undefined;
	const requestGate = new Promise<void>((resolve) => {
		releaseRequest = resolve;
	});
	const expected = { marker: 'canonical-user-data' };
	const dependencies = {
		collectLocalData: async () => {
			collections += 1;
			return { local: true };
		},
		request: async () => {
			requests += 1;
			await requestGate;
			return expected;
		},
	};

	const first = bootstrapUserData('user-1', dependencies);
	const second = bootstrapUserData('user-1', dependencies);
	await Promise.resolve();

	assert.equal(collections, 1);
	assert.equal(requests, 1);
	releaseRequest?.();

	assert.equal(await first, expected);
	assert.equal(await second, expected);
	assert.equal(await bootstrapUserData('user-1', dependencies), expected);
	assert.equal(collections, 1);
	assert.equal(requests, 1);

	resetUserBootstrap('user-1');
	assert.equal(await bootstrapUserData('user-1', dependencies), expected);
	assert.equal(collections, 2);
	assert.equal(requests, 2);
});
