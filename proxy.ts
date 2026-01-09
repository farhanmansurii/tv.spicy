import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
	// Protect /profile route
	if (req.nextUrl.pathname.startsWith('/profile')) {
		if (!req.auth) {
			return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/profile', req.url));
		}
	}
	return NextResponse.next();
});

export const config = {
	matcher: ['/profile/:path*'],
};
