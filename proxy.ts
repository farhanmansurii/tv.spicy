import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Protected routes that require authentication.
 */
const PROTECTED_ROUTES = ['/profile', '/library'];

/**
 * Auth routes that should not be accessible when already authenticated.
 */
const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

function isProtected(path: string): boolean {
	return PROTECTED_ROUTES.some((route) => path.startsWith(route));
}

function isAuthRoute(path: string): boolean {
	return AUTH_ROUTES.some((route) => path.startsWith(route));
}

export default async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const sessionCookie = getSessionCookie(request);
	const isAuthenticated = !!sessionCookie;

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

	return NextResponse.next();
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
