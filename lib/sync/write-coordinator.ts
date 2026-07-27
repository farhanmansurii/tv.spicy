interface PendingWrite {
	fingerprint: string;
	run: () => Promise<void>;
}

interface WriteState {
	latest?: PendingWrite;
	lastWrittenFingerprint?: string;
	lastWrittenAt?: number;
	running?: Promise<boolean>;
}

interface WriteCoordinatorOptions {
	intervalMs: number;
	now?: () => number;
}

/**
 * Coalesces high-frequency client updates into a bounded number of writes.
 *
 * The first checkpoint is persisted immediately. Later checkpoints replace the
 * pending value and are written only after the interval or an explicit flush.
 */
export class WriteCoordinator {
	private readonly states = new Map<string, WriteState>();
	private readonly intervalMs: number;
	private readonly now: () => number;

	constructor({ intervalMs, now = Date.now }: WriteCoordinatorOptions) {
		this.intervalMs = intervalMs;
		this.now = now;
	}

	async schedule(
		key: string,
		fingerprint: string,
		run: () => Promise<void>
	): Promise<boolean> {
		const state = this.getState(key);
		if (
			state.latest?.fingerprint === fingerprint ||
			(!state.latest && state.lastWrittenFingerprint === fingerprint)
		) {
			return false;
		}

		state.latest = { fingerprint, run };
		const intervalElapsed =
			state.lastWrittenAt === undefined ||
			this.now() - state.lastWrittenAt >= this.intervalMs;
		return intervalElapsed ? this.execute(key, false) : false;
	}

	async flush(key: string): Promise<boolean> {
		return this.execute(key, true);
	}

	async flushAll(): Promise<void> {
		await Promise.all([...this.states.keys()].map((key) => this.flush(key)));
	}

	cancel(key: string): void {
		this.states.delete(key);
	}

	private getState(key: string): WriteState {
		const existing = this.states.get(key);
		if (existing) return existing;

		const created: WriteState = {};
		this.states.set(key, created);
		return created;
	}

	private async execute(key: string, force: boolean): Promise<boolean> {
		const state = this.getState(key);
		if (state.running) {
			await state.running;
			return this.execute(key, force);
		}

		const latest = state.latest;
		if (!latest || latest.fingerprint === state.lastWrittenFingerprint) {
			return false;
		}

		if (
			!force &&
			state.lastWrittenAt !== undefined &&
			this.now() - state.lastWrittenAt < this.intervalMs
		) {
			return false;
		}

		const operation = (async () => {
			await latest.run();
			state.lastWrittenFingerprint = latest.fingerprint;
			state.lastWrittenAt = this.now();
			if (state.latest === latest) {
				state.latest = undefined;
			}
			return true;
		})();

		state.running = operation;
		try {
			return await operation;
		} finally {
			if (state.running === operation) {
				state.running = undefined;
			}
		}
	}
}
