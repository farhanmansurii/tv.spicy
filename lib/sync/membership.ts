/**
 * Server-membership contract for watchlist/favorites/history lists:
 *
 * The server list decides membership. An item is uploaded only while the server
 * has never confirmed it (`syncedAt` is unset); once confirmed, a pull that no
 * longer lists it means it was deleted elsewhere and the local copy is dropped.
 * Local deletes are tombstoned until a pull confirms the server dropped them.
 */

export type Tombstones = Record<string, number>;

export interface MembershipItem {
	key: string;
	syncedAt?: string | null;
}

const MAX_TOMBSTONES = 200;

export function addTombstones(tombstones: Tombstones, keys: Iterable<string>): Tombstones {
	const now = Date.now();
	const next: Tombstones = { ...tombstones };
	for (const key of keys) {
		next[key] = now;
	}
	return pruneTombstones(next);
}

export function clearTombstones(tombstones: Tombstones, keys: Iterable<string>): Tombstones {
	const next: Tombstones = { ...tombstones };
	for (const key of keys) {
		delete next[key];
	}
	return next;
}

export function pruneTombstones(tombstones: Tombstones): Tombstones {
	const entries = Object.entries(tombstones);
	if (entries.length <= MAX_TOMBSTONES) {
		return tombstones;
	}

	entries.sort((a, b) => a[1] - b[1]);
	return Object.fromEntries(entries.slice(entries.length - MAX_TOMBSTONES));
}

/** Drop tombstones the server has confirmed (the key is gone server-side) and cap the rest. */
export function confirmTombstones(tombstones: Tombstones, serverKeys: Set<string>): Tombstones {
	const next: Tombstones = {};
	for (const [key, deletedAt] of Object.entries(tombstones)) {
		if (serverKeys.has(key)) {
			next[key] = deletedAt;
		}
	}
	return pruneTombstones(next);
}

/**
 * Reconcile local items against a server snapshot. Local-only items survive
 * only when the server never confirmed them (pending adds); everything else
 * follows the server, which is what lets deletions propagate across devices.
 */
export function mergeWithServer<T extends MembershipItem>(
	serverItems: T[],
	localItems: T[],
	tombstones: Tombstones
): T[] {
	const now = new Date().toISOString();
	const serverKeys = new Set(serverItems.map((item) => item.key));
	const localByKey = new Map(localItems.map((item) => [item.key, item]));
	const merged: T[] = [];
	const seen = new Set<string>();

	for (const serverItem of serverItems) {
		if (serverItem.key in tombstones || seen.has(serverItem.key)) {
			continue;
		}
		seen.add(serverItem.key);
		const localItem = localByKey.get(serverItem.key);
		merged.push(
			localItem ? { ...localItem, syncedAt: localItem.syncedAt ?? now } : { ...serverItem, syncedAt: now }
		);
	}

	for (const localItem of localItems) {
		if (serverKeys.has(localItem.key) || localItem.key in tombstones) {
			continue;
		}
		if (localItem.syncedAt) {
			// The server confirmed this item before but no longer lists it: deleted elsewhere.
			continue;
		}
		merged.push(localItem);
	}

	return merged;
}

/** Strip the bookkeeping key before storing merged items back into the zustand state. */
export function stripMembershipKey<T extends { key: string }>(item: T): Omit<T, 'key'> {
	const { key: _key, ...rest } = item;
	return rest;
}
