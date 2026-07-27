import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

process.env.TMDB_API_KEY = 'test-key';

const originalFetch = globalThis.fetch;

async function fetchDetails(id: string, type: 'movie' | 'tv') {
	const { fetchDetailsTMDB } = await import('./tmdb-client');
	return fetchDetailsTMDB(id, type);
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

test('missing detail records resolve to null', async () => {
	globalThis.fetch = async () =>
		new Response(
			JSON.stringify({
				success: false,
				status_code: 34,
				status_message: 'The resource you requested could not be found.',
			}),
			{ status: 404, headers: { 'Content-Type': 'application/json' } }
		);

	assert.equal(await fetchDetails('missing', 'movie'), null);
});

test('operational detail failures escape instead of becoming cacheable not-found results', async () => {
	let attempts = 0;
	globalThis.fetch = async () => {
		attempts += 1;
		return new Response(
			JSON.stringify({
				success: false,
				status_code: 11,
				status_message: 'Internal error.',
			}),
			{ status: 503, headers: { 'Content-Type': 'application/json' } }
		);
	};

	await assert.rejects(() => fetchDetails('550', 'movie'), /TMDB API Error \(503\)/);
	assert.equal(attempts, 2);
});
