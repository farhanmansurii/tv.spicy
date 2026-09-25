import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db/prisma';
import { AUTH_SERVER_COOKIE_CACHE } from '@/lib/auth-session-options';

const isProduction = process.env.NODE_ENV === 'production';
// `next build` sets this while compiling/prerendering: boot-time guards skip
// the build phase so the artifact can still be produced, while the server
// itself fails fast on boot when configuration is missing.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

function isLocalhost(hostname: string): boolean {
	return (
		hostname === 'localhost' ||
		hostname.endsWith('.localhost') ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]'
	);
}

/**
 * Parse a candidate into a validated absolute origin, or null when it is not
 * a usable http(s) origin. In production localhost origins are rejected — the
 * production origin must be derived from real configuration, never assumed.
 */
function normalizeOrigin(value: string): string | null {
	let url: URL;
	try {
		url = new URL(value.trim());
	} catch {
		return null;
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
	if (url.username || url.password) return null;
	if (isProduction && isLocalhost(url.hostname)) return null;
	return url.origin;
}

/**
 * Derive the base URL from environment configuration.
 * Production requires a valid, validated origin — there is no hardcoded
 * fallback — and fails fast when none can be determined.
 */
function getBaseURL(): string {
	// Priority: BETTER_AUTH_URL > NEXTAUTH_URL > NEXT_PUBLIC_SITE_URL >
	// Vercel production domain > current deployment > localhost
	const candidates = [
		process.env.BETTER_AUTH_URL,
		process.env.NEXTAUTH_URL,
		process.env.NEXT_PUBLIC_SITE_URL,
		process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: undefined,
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
	];

	for (const candidate of candidates) {
		if (!candidate) continue;
		const origin = normalizeOrigin(candidate);
		if (origin) return origin;
	}

	if (isProduction && !isBuildPhase) {
		throw new Error(
			'[auth] A valid production origin is required. Set BETTER_AUTH_URL (or NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL) to an absolute http(s) origin.'
		);
	}

	// Build phase / development fallback; production boot throws above.
	return 'http://localhost:3000';
}

/**
 * Resolve the session secret. Never defaults to '' — an empty secret would let
 * better-auth silently fall back to its public development default in
 * production. Production without a secret fails fast at boot.
 */
function resolveSecret(): string | undefined {
	const secret =
		process.env.BETTER_AUTH_SECRET ||
		process.env.NEXTAUTH_SECRET ||
		process.env.AUTH_SECRET ||
		undefined;

	if (secret) return secret;

	if (isProduction && !isBuildPhase) {
		throw new Error(
			'[auth] BETTER_AUTH_SECRET (or NEXTAUTH_SECRET) must be set in production. Refusing to start without a session secret.'
		);
	}

	console.warn(
		isBuildPhase
			? '[auth] No BETTER_AUTH_SECRET configured; the built server will fail fast on boot.'
			: '[auth] No BETTER_AUTH_SECRET configured (development only).'
	);
	return undefined;
}

const baseURL = getBaseURL();
const secret = resolveSecret();

// Trusted origins: always include the derived base origin (in every
// environment), plus the localhost origins used during development.
const trustedOrigins = (() => {
	const origins = new Set<string>([baseURL]);
	if (!isProduction) {
		origins.add('http://localhost:3000');
		origins.add('http://localhost');
	}
	return Array.from(origins);
})();

if (isProduction && !isBuildPhase && (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
	// next.config.js strips console output in production, so this is a
	// development-time signal only; Google sign-in stays disabled without them.
	console.error('⚠️  GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in production');
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		},
	},
	baseURL,
	basePath: '/api/auth',
	secret,
	trustedOrigins,
	session: {
		cookieCache: AUTH_SERVER_COOKIE_CACHE,
	},
});

export type Session = typeof auth.$Infer.Session;
