import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { auth } from '@/lib/auth';

/**
 * Protected routes that require authentication.
 */
const PROTECTED_ROUTES = ['/profile', '/library'];

/**
 * Auth routes that should not be accessible when already authenticated.
 */
const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

/** Better Auth session cookies (token + cookie cache, plain and `__Secure-`). */
const SESSION_COOKIE_MARKER = 'better-auth.session';

function isProtected(path: string): boolean {
	return PROTECTED_ROUTES.some((route) => path.startsWith(route));
}

function isAuthRoute(path: string): boolean {
	return AUTH_ROUTES.some((route) => path.startsWith(route));
}

type SessionState =
	/** A valid session was verified server-side. */
	| 'authenticated'
	/** No session cookie at all. */
	| 'anonymous'
	/** Cookies present but verification definitively failed (stale/expired). */
	| 'invalid'
	/** Verification could not run (e.g. transient DB error) — treat as anonymous but keep cookies. */
	| 'error';

/**
 * Verify the session with Better Auth instead of trusting cookie presence.
 * Cookie *presence* is not authentication: an invalid/expired cookie used to
 * bounce every visit to /auth/signin back to `/`, permanently blocking sign-in.
 */
async function verifySession(request: NextRequest): Promise<SessionState> {
	if (!getSessionCookie(request)) {
		return 'anonymous';
	}

	try {
		const session = await auth.api.getSession({ headers: request.headers });
		return session?.user?.id ? 'authenticated' : 'invalid';
	} catch (error) {
		console.error('Failed to verify session in proxy:', error);
		return 'error';
	}
}

/**
 * Clear session cookies that failed verification so a stale value can never
 * re-trigger a redirect or linger after the user signs in again.
 */
function clearSessionCookies(request: NextRequest, response: NextResponse) {
	const isHttps = request.nextUrl.protocol === 'https:';
	for (const cookie of request.cookies.getAll()) {
		if (!cookie.name.includes(SESSION_COOKIE_MARKER)) continue;
		response.cookies.set({
			name: cookie.name,
			value: '',
			path: '/',
			maxAge: 0,
			httpOnly: true,
			sameSite: 'lax',
			// Browsers reject deletion Set-Cookies for `__Secure-` names unless
			// they carry `Secure`; Secure is also what production was set with.
			secure: isHttps,
		});
	}
}

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const sessionState = await verifySession(request);
	const isAuthenticated = sessionState === 'authenticated';

	// Redirect authenticated users away from auth pages
	if (isAuthenticated && isAuthRoute(pathname)) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	// Redirect unauthenticated users away from protected pages
	if (!isAuthenticated && isProtected(pathname)) {
		const signInUrl = new URL('/auth/signin', request.url);
		signInUrl.searchParams.set('callbackUrl', pathname);
		return NextResponse.redirect(signInUrl);
	}

	const response = NextResponse.next();

	if (sessionState === 'invalid') {
		clearSessionCookies(request, response);
	}

	return response;
}

export const config = {
	matcher: [
		// Protected routes + auth routes
		'/profile/:path*',
		'/library/:path*',
		'/auth/signin',
		'/auth/signup',
	],
};
