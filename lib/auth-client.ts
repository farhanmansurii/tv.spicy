'use client';

import { createAuthClient } from 'better-auth/react';

const baseURL = (process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

export const authClient = createAuthClient({
	baseURL,
	basePath: '/api/auth',
});

export const { signIn, signOut, signUp, useSession } = authClient;
