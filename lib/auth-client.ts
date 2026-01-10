'use client';

import { createAuthClient } from 'better-auth/react';

// Get baseURL from environment or auto-detect
function getBaseURL(): string {
	// Priority: NEXT_PUBLIC_BETTER_AUTH_URL > window.location.origin > localhost
	if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
		return process.env.NEXT_PUBLIC_BETTER_AUTH_URL.replace(/\/$/, '');
	}
	// Auto-detect from current origin (works in browser)
	if (typeof window !== 'undefined') {
		return window.location.origin;
	}
	// Fallback for SSR
	return 'https://spicy-tv.vercel.app';
}

const baseURL = getBaseURL();

export const authClient = createAuthClient({
	baseURL,
	basePath: '/api/auth',
});

export const { signIn, signOut, signUp, useSession } = authClient;
