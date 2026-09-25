import type { StateStorage } from 'zustand/middleware';

import { useAuthStore } from '@/store/authStore';

const LEGACY_CLAIM_SUFFIX = ':legacy-claimed';

/**
 * Persist keys are namespaced per user so a shared device never bleeds one
 * account's watchlist/favorites/history into another. The signed-out case keeps
 * using the original (legacy) key, and the first user to sign in on a device
 * claims any pre-existing anonymous data exactly once.
 */
export function userScopedKey(baseKey: string, userId: string | null): string {
	return userId ? `${baseKey}:user:${userId}` : baseKey;
}

function safeGet(key: string): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(key);
	} catch (error) {
		console.error('Failed to read scoped storage:', error);
		return null;
	}
}

function safeSet(key: string, value: string): boolean {
	if (typeof window === 'undefined') return false;
	try {
		window.localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.error('Failed to write scoped storage:', error);
		return false;
	}
}

/**
 * Resolve the storage slot for `userId` and make sure it holds the right data.
 * Returns true when persisted data exists for this scope. For a signed-in user
 * with no slot yet, the legacy anonymous payload is migrated in exactly once
 * (guarded by a claim marker) so existing anonymous data is not lost.
 */
export function ensureUserScopedData(baseKey: string, userId: string | null): boolean {
	if (typeof window === 'undefined') return false;

	const scopedKey = userScopedKey(baseKey, userId);

	if (userId) {
		const markerKey = `${baseKey}${LEGACY_CLAIM_SUFFIX}`;
		if (safeGet(markerKey) === null) {
			const legacy = safeGet(baseKey);
			if (legacy !== null && safeSet(markerKey, userId) && safeGet(scopedKey) === null) {
				safeSet(scopedKey, legacy);
			}
		}
	}

	return safeGet(scopedKey) !== null;
}

/**
 * Zustand storage adapter that resolves the physical localStorage key on every
 * read/write from the live auth state, so hydration always lands on the active
 * user's slot without reconfiguring the persist middleware.
 */
export function createUserScopedStorage(baseKey: string): StateStorage {
	const scopedKey = (name: string) => userScopedKey(name || baseKey, useAuthStore.getState().userId);

	return {
		getItem: (name) => safeGet(scopedKey(name)),
		setItem: (name, value) => {
			safeSet(scopedKey(name), value);
		},
		removeItem: (name) => {
			if (typeof window === 'undefined') return;
			try {
				window.localStorage.removeItem(scopedKey(name));
			} catch (error) {
				console.error('Failed to remove scoped storage:', error);
			}
		},
	};
}
