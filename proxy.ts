import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export default async function proxy(request: NextRequest) {
	// Protect /profile route
	if (request.nextUrl.pathname.startsWith('/profile')) {
		const sessionCookie = getSessionCookie(request);
		if (!sessionCookie) {
			return NextResponse.redirect(
				new URL('/auth/signin?callbackUrl=/profile', request.url)
			);
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/profile/:path*'],
};
