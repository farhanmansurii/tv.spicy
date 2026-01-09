import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db/prisma';

const baseURL = (process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

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
