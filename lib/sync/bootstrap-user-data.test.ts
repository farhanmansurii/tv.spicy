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

test('failed uploads are retried with backoff and only a success is cached', async () => {
	let requests = 0;
	const result = await bootstrapUserData(
		'user-retry',
		{
			collectLocalData: async () => ({ local: true }),
			request: async () => {
				requests += 1;
				if (requests < 3) {
					throw new Error('upload failed');
				}
				return { marker: 'recovered' };
			},
		},
		{ retryDelaysMs: [1, 1] }
	);

	assert.deepEqual(result, { marker: 'recovered' });
	assert.equal(requests, 3);

	// The successful result is now cached: no further request is made.
	assert.deepEqual(
		await bootstrapUserData('user-retry', {
			collectLocalData: async () => {
				throw new Error('should not collect again');
			},
			request: async () => {
				throw new Error('should not request again');
			},
		}),
		{ marker: 'recovered' }
	);
});

test('bootstrap rejects after exhausting retries without caching the failure', async () => {
	let requests = 0;
	const failing = {
		collectLocalData: async () => ({}),
		request: async (): Promise<never> => {
			requests += 1;
			throw new Error('still down');
		},
	};

	await assert.rejects(
		bootstrapUserData('user-down', failing, { retryDelaysMs: [1, 1] }),
		/still down/
	);
	assert.equal(requests, 3);

	// Failure was not cached: a later call with a healthy request succeeds.
	assert.deepEqual(
		await bootstrapUserData('user-down', {
			collectLocalData: async () => ({}),
			request: async () => ({ marker: 'recovered' }),
		}),
		{ marker: 'recovered' }
	);
});

test('retries stop once isCurrent reports the user is no longer active', async () => {
	let requests = 0;
	let active = true;

	await assert.rejects(
		bootstrapUserData(
			'user-churn',
			{
				collectLocalData: async () => ({}),
				request: async () => {
					requests += 1;
					active = false;
					throw new Error('upload failed');
				},
			},
			{ retryDelaysMs: [1, 1], isCurrent: () => active }
		),
		/upload failed/
	);

	assert.equal(requests, 1);
});
