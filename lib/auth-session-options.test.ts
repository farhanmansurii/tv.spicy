import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	AUTH_CLIENT_SESSION_OPTIONS,
	AUTH_SERVER_COOKIE_CACHE,
} from './auth-session-options';

test('session client performs no polling or focus and offline revalidation', () => {
	assert.deepEqual(AUTH_CLIENT_SESSION_OPTIONS, {
		refetchInterval: 0,
		refetchOnWindowFocus: false,
		refetchWhenOffline: false,
	});
});

test('server session validation uses a five-minute compact signed cookie', () => {
	assert.deepEqual(AUTH_SERVER_COOKIE_CACHE, {
		enabled: true,
		maxAge: 5 * 60,
		strategy: 'compact',
	});
});
