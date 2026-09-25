import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

process.env.TMDB_API_KEY = 'test-key';

const originalFetch = globalThis.fetch;

async function fetchDetails(id: string, type: 'movie' | 'tv') {
	const { fetchDetailsTMDB } = await import('./tmdb-client');
	return fetchDetailsTMDB(id, type);
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(body), {
		headers: { 'Content-Type': 'application/json' },
		...init,
	});
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

test('missing detail records resolve to null', async () => {
	globalThis.fetch = async () =>
		jsonResponse(
			{
				success: false,
				status_code: 34,
				status_message: 'The resource you requested could not be found.',
			},
			{ status: 404 }
		);

	assert.equal(await fetchDetails('missing', 'movie'), null);
});

test('operational detail failures escape instead of becoming cacheable not-found results', async () => {
	let attempts = 0;
	globalThis.fetch = async () => {
		attempts += 1;
		return jsonResponse(
			{
				success: false,
				status_code: 11,
				status_message: 'Internal error.',
			},
			{ status: 503 }
		);
	};

	await assert.rejects(() => fetchDetails('550', 'movie'), /TMDB API Error \(503\)/);
	// 503s are retried with exponential backoff: initial attempt + MAX_RETRIES.
	assert.equal(attempts, 3);
});

test('row failures propagate instead of masquerading as empty results', async () => {
	let attempts = 0;
	globalThis.fetch = async () => {
		attempts += 1;
		return jsonResponse({ status_message: 'Service unavailable.' }, { status: 503 });
	};

	const { fetchRowDataStrict } = await import('./tmdb-client');
	await assert.rejects(() => fetchRowDataStrict('tv/popular'), /TMDB API Error \(503\)/);
	assert.equal(attempts, 3);

	// The lenient variant still degrades to an empty row for page rendering.
	const { fetchRowData } = await import('./tmdb-client');
	attempts = 0;
	assert.deepEqual(await fetchRowData('tv/popular'), []);
	assert.equal(attempts, 3);
});

test('genuinely empty TMDB results stay distinguishable (and cacheable)', async () => {
	globalThis.fetch = async () => jsonResponse({ results: [], page: 1 });

	const { fetchRowDataStrict } = await import('./tmdb-client');
	assert.deepEqual(await fetchRowDataStrict('tv/popular'), []);
});

test('basic detail failures throw instead of resolving to null', async () => {
	globalThis.fetch = async () => jsonResponse({ status_message: 'boom' }, { status: 502 });

	const { fetchBasicDetailsTMDB } = await import('./tmdb-client');
	await assert.rejects(() => fetchBasicDetailsTMDB('603', 'movie'), /TMDB API Error \(502\)/);
});

test('429 responses are retried after honouring Retry-After', async () => {
	let attempts = 0;
	const startedAt = Date.now();
	globalThis.fetch = async () => {
		attempts += 1;
		if (attempts === 1) {
			return new Response(JSON.stringify({ status_message: 'rate limited' }), {
				status: 429,
				headers: { 'Content-Type': 'application/json', 'Retry-After': '1' },
			});
		}
		return jsonResponse({ results: [], page: 1 });
	};

	const { fetchRowDataStrict } = await import('./tmdb-client');
	assert.deepEqual(await fetchRowDataStrict('tv/popular'), []);
	assert.equal(attempts, 2);
	// Waited for Retry-After (1s) instead of failing immediately.
	assert.ok(Date.now() - startedAt >= 900, 'expected the Retry-After delay to be honoured');
});
