/**
 * Minimal in-memory fixed-window rate limiter for mutating API routes.
 *
 * Implemented without a new dependency (audit requirement). The counter is per
 * process — on serverless deployments each instance keeps its own map, so this
 * is a best-effort burst guard, not a coordinated hard quota.
 */

interface Bucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

/** Default budget for mutating routes: `limit` requests per `windowMs`, per user. */
export const MUTATION_RATE_LIMIT = { limit: 60, windowMs: 60_000 } as const;

function pruneExpired(now: number) {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}

/**
 * Records one request against `key`.
 *
 * Returns `null` when the request is allowed, otherwise the number of seconds
 * the caller should report via `Retry-After`.
 */
export function rateLimitRetryAfter(
	key: string,
	limit: number = MUTATION_RATE_LIMIT.limit,
	windowMs: number = MUTATION_RATE_LIMIT.windowMs
): number | null {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		if (buckets.size >= MAX_TRACKED_KEYS) {
			pruneExpired(now);
			// Pathological key churn: fail open rather than grow without bound.
			if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
		}
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return null;
	}

	if (bucket.count >= limit) {
		return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
	}

	bucket.count += 1;
	return null;
}
