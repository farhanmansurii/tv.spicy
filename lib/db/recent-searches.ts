import { prisma } from './prisma';

export async function getRecentSearches(userId: string, limit: number = 10) {
	return prisma.recentSearch.findMany({
		where: { userId },
		orderBy: { searchedAt: 'desc' },
		take: limit,
		distinct: ['query'],
	});
}

export async function addRecentSearch(userId: string, query: string) {
	// Remove existing search with same query to avoid duplicates
	await prisma.recentSearch.deleteMany({
		where: {
			userId,
			query,
		},
	});

	return prisma.recentSearch.create({
		data: {
			userId,
			query,
		},
	});
}

export async function clearRecentSearches(userId: string) {
	return prisma.recentSearch.deleteMany({
		where: { userId },
	});
}
