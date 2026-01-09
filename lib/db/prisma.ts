import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const getPrismaClient = () => {
	if (process.env.PRISMA_DATABASE_URL) {
		return new PrismaClient({
			accelerateUrl: process.env.PRISMA_DATABASE_URL,
			log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
		});
	} else {
		const pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});
		const adapter = new PrismaPg(pool);
		return new PrismaClient({
			adapter,
			log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
		});
	}
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
