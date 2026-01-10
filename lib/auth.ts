import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db/prisma';

// Get baseURL from environment or auto-detect from request
function getBaseURL(): string {
	// Priority: BETTER_AUTH_URL > NEXTAUTH_URL > VERCEL_URL > localhost
	if (process.env.BETTER_AUTH_URL) {
		return process.env.BETTER_AUTH_URL.replace(/\/$/, '');
	}
	if (process.env.NEXTAUTH_URL) {
		return process.env.NEXTAUTH_URL.replace(/\/$/, '');
	}
	// Auto-detect from Vercel deployment
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	// Fallback to localhost for development
	return 'https://spicy-tv.vercel.app';
}

const baseURL = getBaseURL();

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
	if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
		console.error('⚠️  GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in production');
	}
	if (!process.env.BETTER_AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
		console.error('⚠️  BETTER_AUTH_SECRET or NEXTAUTH_SECRET must be set in production');
	}
	if (baseURL.includes('localhost')) {
		console.warn('⚠️  baseURL is set to localhost in production. Set BETTER_AUTH_URL or NEXTAUTH_URL environment variable.');
	}
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
	secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || '',
});

export type Session = typeof auth.$Infer.Session;
