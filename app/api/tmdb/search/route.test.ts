import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

process.env.TMDB_API_KEY = 'test-key';

const originalFetch = globalThis.fetch;
const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

async function runSearch(query: string) {
	const { NextRequest } = await import('next/server');
	const { GET } = await import('./route');
	return GET(new NextRequest(`http://localhost:3000/api/tmdb/search?${query}`));
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

test('queries below the minimum length are rejected before any upstream request', async () => {
	let upstream = 0;
	globalThis.fetch = async () => {
		upstream += 1;
		return new Response('{}');
	};

	const response = await runSearch('query=a');
	assert.equal(response.status, 400);
	assert.deepEqual(await response.json(), { error: 'Invalid search parameters' });
	assert.equal(upstream, 0);
});

test('out of range and non-integer pages are rejected', async () => {
	let upstream = 0;
	globalThis.fetch = async () => {
		upstream += 1;
		return new Response('{}');
	};

	for (const query of ['query=batman&page=0', 'query=batman&page=501', 'query=batman&page=abc']) {
		const response = await runSearch(query);
		assert.equal(response.status, 400, query);
	}
	assert.equal(upstream, 0);
});

test('valid searches forward the query, filter to titles and set cache headers', async () => {
	let requested = '';
	globalThis.fetch = async (input) => {
		requested = String(input);
		return new Response(
			JSON.stringify({
				page: 1,
				results: [
					{ id: 1, media_type: 'movie' },
					{ id: 2, media_type: 'tv' },
					{ id: 3, media_type: 'person' },
				],
				total_pages: 1,
				total_results: 3,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	};

	const response = await runSearch('query=batman&page=1');
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('Cache-Control'), CACHE_CONTROL);
	assert.equal(response.headers.get('Vercel-CDN-Cache-Control'), CACHE_CONTROL);

	const body = await response.json();
	assert.deepEqual(
		body.results.map((result: { id: number }) => result.id),
		[1, 2]
	);
	assert.match(requested, /\/search\/multi/);
	assert.match(requested, /query=batman/);
	assert.match(requested, /api_key=test-key/);
});

test('an upstream failure answers 502 and is never cacheable', async () => {
	globalThis.fetch = async () =>
		new Response(JSON.stringify({ status_message: 'Internal error.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});

	const response = await runSearch('query=batman&page=1');
	assert.equal(response.status, 502);
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
	assert.equal(response.headers.get('Vercel-CDN-Cache-Control'), 'no-store');
	assert.deepEqual(await response.json(), {
		error: 'Upstream provider returned an error',
	});
});
