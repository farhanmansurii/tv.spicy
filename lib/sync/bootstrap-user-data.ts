export interface BootstrapUserDataDependencies<LocalData, Result> {
	collectLocalData: () => Promise<LocalData>;
	request: (localData: LocalData) => Promise<Result>;
}

export interface BootstrapUserDataOptions {
	/** Delay before each retry attempt in ms. Defaults to [1500, 6000] (3 attempts total). */
	retryDelaysMs?: number[];
	/** Checked before every attempt; return false to abandon retries (e.g. the user signed out). */
	isCurrent?: () => boolean;
}

const DEFAULT_RETRY_DELAYS_MS = [1500, 6000];

const inFlightByUser = new Map<string, Promise<unknown>>();
const completedByUser = new Map<string, unknown>();

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Run the signed-in data bootstrap once per user/browser session.
 *
 * The module-level maps survive React remounts and Strict Mode effect retries,
 * preventing separate components from starting duplicate sync requests.
 *
 * A result is only cached on success: failed uploads are retried with backoff
 * and the failure propagates to the caller, so callers never mark a failed sync
 * as complete.
 */
export function bootstrapUserData<LocalData, Result>(
	userId: string | null,
	dependencies: BootstrapUserDataDependencies<LocalData, Result>,
	options: BootstrapUserDataOptions = {}
): Promise<Result | null> {
	if (!userId) {
		return Promise.resolve(null);
	}

	if (completedByUser.has(userId)) {
		return Promise.resolve(completedByUser.get(userId) as Result);
	}

	const existing = inFlightByUser.get(userId);
	if (existing) {
		return existing as Promise<Result>;
	}

	const retryDelaysMs = options.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS;
	const isCurrent = options.isCurrent;

	const request = (async () => {
		try {
			let lastError: unknown = new Error('Bootstrap failed');

			for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
				if (isCurrent && !isCurrent()) {
					throw lastError;
				}

				try {
					const localData = await dependencies.collectLocalData();
					const result = await dependencies.request(localData);
					completedByUser.set(userId, result);
					return result;
				} catch (error) {
					lastError = error;
					const nextDelay = retryDelaysMs[attempt];
					if (nextDelay === undefined) {
						break;
					}
					await delay(nextDelay);
				}
			}

			throw lastError;
		} finally {
			inFlightByUser.delete(userId);
		}
	})();

	inFlightByUser.set(userId, request);
	return request;
}

export function resetUserBootstrap(userId?: string): void {
	if (userId) {
		inFlightByUser.delete(userId);
		completedByUser.delete(userId);
		return;
	}

	inFlightByUser.clear();
	completedByUser.clear();
}
