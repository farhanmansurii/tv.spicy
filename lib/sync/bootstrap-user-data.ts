export interface BootstrapUserDataDependencies<LocalData, Result> {
	collectLocalData: () => Promise<LocalData>;
	request: (localData: LocalData) => Promise<Result>;
}

const inFlightByUser = new Map<string, Promise<unknown>>();
const completedByUser = new Map<string, unknown>();

/**
 * Run the signed-in data bootstrap once per user/browser session.
 *
 * The module-level maps survive React remounts and Strict Mode effect retries,
 * preventing separate components from starting duplicate sync requests.
 */
export function bootstrapUserData<LocalData, Result>(
	userId: string | null,
	dependencies: BootstrapUserDataDependencies<LocalData, Result>
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

	const request = (async () => {
		try {
			const localData = await dependencies.collectLocalData();
			const result = await dependencies.request(localData);
			completedByUser.set(userId, result);
			return result;
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
