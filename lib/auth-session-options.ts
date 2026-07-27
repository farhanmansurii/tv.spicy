/**
 * Shared request-budget configuration for Better Auth.
 *
 * Keep these values outside the client/server auth modules so their behavior is
 * independently testable without initializing React, Prisma, or Better Auth.
 */
export const AUTH_CLIENT_SESSION_OPTIONS = {
	refetchInterval: 0,
	refetchOnWindowFocus: false,
	refetchWhenOffline: false,
} as const;

export const AUTH_SERVER_COOKIE_CACHE = {
	enabled: true,
	maxAge: 5 * 60,
	strategy: 'compact',
} as const;
