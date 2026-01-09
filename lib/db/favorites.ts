import { prisma } from './prisma';
import { MediaType } from '@prisma/client';

export async function getFavorites(userId: string, mediaType?: 'movie' | 'tv') {
	const where: any = { userId };
	if (mediaType) {
		where.mediaType = mediaType.toUpperCase() as MediaType;
	}

	return prisma.favorite.findMany({
		where,
		orderBy: { addedAt: 'desc' },
	});
}

export async function addFavorite(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
	return prisma.favorite.upsert({
		where: {
			userId_mediaId_mediaType: {
				userId,
				mediaId,
				mediaType: mediaType.toUpperCase() as MediaType,
			},
		},
		update: {},
		create: {
			userId,
			mediaId,
			mediaType: mediaType.toUpperCase() as MediaType,
		},
	});
}

export async function removeFavorite(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
	return prisma.favorite.deleteMany({
		where: {
			userId,
			mediaId,
			mediaType: mediaType.toUpperCase() as MediaType,
		},
	});
}

export async function isFavorite(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
	const item = await prisma.favorite.findUnique({
		where: {
			userId_mediaId_mediaType: {
				userId,
				mediaId,
				mediaType: mediaType.toUpperCase() as MediaType,
			},
		},
	});
	return !!item;
}

export async function clearFavorites(userId: string, mediaType?: 'movie' | 'tv') {
	const where: any = { userId };
	if (mediaType) {
		where.mediaType = mediaType.toUpperCase() as MediaType;
	}
	return prisma.favorite.deleteMany({ where });
}
