import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

process.env.TMDB_API_KEY = 'test-key';

const originalFetch = globalThis.fetch;
const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=604800';

async function runDetails(query: string) {
	const { NextRequest } = await import('next/server');
	const { GET } = await import('./route');
	return GET(new NextRequest(`http://localhost:3000/api/tmdb/details?${query}`));
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

test('invalid ids and types are rejected before any upstream request', async () => {
	let upstream = 0;
	globalThis.fetch = async () => {
		upstream += 1;
		return jsonResponse({});
	};

	for (const query of ['id=0&type=movie', 'id=abc&type=tv', 'id=603&type=person', 'type=movie']) {
		const response = await runDetails(query);
		assert.equal(response.status, 400, query);
		assert.equal(response.headers.get('Cache-Control'), 'no-store', query);
	}
	assert.equal(upstream, 0);
});

test('details include the billed cast from a single appended credits request', async () => {
	const requested: string[] = [];
	globalThis.fetch = async (input) => {
		requested.push(String(input));
		return jsonResponse({
			id: 603,
			title: 'The Matrix',
			credits: {
				cast: [
					{
						id: 3,
						name: 'Carrie-Anne Moss',
						character: 'Trinity',
						order: 2,
						profile_path: '/c.jpg',
						popularity: 9,
					},
					{
						id: 1,
						name: 'Keanu Reeves',
						character: 'Neo',
						order: 0,
						profile_path: '/k.jpg',
						popularity: 50,
					},
					{
						id: 2,
						name: 'Laurence Fishburne',
						character: 'Morpheus',
						order: 1,
						profile_path: null,
					},
				],
				crew: [{ id: 9, name: 'Lana Wachowski', job: 'Director' }],
			},
		});
	};

	const response = await runDetails('id=603&type=movie');
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('Cache-Control'), CACHE_CONTROL);
	assert.equal(response.headers.get('Vercel-CDN-Cache-Control'), CACHE_CONTROL);

	const body = await response.json();
	assert.equal(body.title, 'The Matrix');
	assert.equal(body.credits, undefined);
	assert.deepEqual(body.cast, [
		{ id: 1, name: 'Keanu Reeves', character: 'Neo', order: 0, profile_path: '/k.jpg' },
		{ id: 2, name: 'Laurence Fishburne', character: 'Morpheus', order: 1, profile_path: null },
		{ id: 3, name: 'Carrie-Anne Moss', character: 'Trinity', order: 2, profile_path: '/c.jpg' },
	]);

	assert.equal(requested.length, 1);
	assert.match(requested[0], /\/movie\/603\?/);
	assert.match(requested[0], /append_to_response=credits/);
});

test('cast is capped to the card-sized limit', async () => {
	globalThis.fetch = async () =>
		jsonResponse({
			id: 1399,
			name: 'Game of Thrones',
			credits: {
				cast: Array.from({ length: 45 }, (_, index) => ({
					id: index + 1,
					name: `Actor ${index + 1}`,
					order: index,
				})),
				crew: [],
			},
		});

	const body = await (await runDetails('id=1399&type=tv')).json();
	assert.equal(body.cast.length, 20);
	assert.equal(body.cast[0].name, 'Actor 1');
	assert.equal(body.cast[19].name, 'Actor 20');
});

test('unknown ids answer a stable 404', async () => {
	globalThis.fetch = async () =>
		jsonResponse(
			{
				success: false,
				status_code: 34,
				status_message: 'The resource you requested could not be found.',
			},
			{ status: 404 }
		);

	const response = await runDetails('id=999999999&type=movie');
	assert.equal(response.status, 404);
	assert.deepEqual(await response.json(), { error: 'Media not found' });
});

test('an upstream failure answers 502 and is never cacheable', async () => {
	globalThis.fetch = async () =>
		jsonResponse({ status_message: 'Internal error.' }, { status: 500 });

	const response = await runDetails('id=603&type=movie');
	assert.equal(response.status, 502);
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
	assert.equal(response.headers.get('Vercel-CDN-Cache-Control'), 'no-store');
	assert.deepEqual(await response.json(), {
		error: 'Upstream provider returned an error',
	});
});

test('a details payload without credits is an upstream failure, not an empty cast', async () => {
	globalThis.fetch = async () => jsonResponse({ id: 603, title: 'The Matrix' });

	const response = await runDetails('id=603&type=movie');
	assert.equal(response.status, 502);
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
