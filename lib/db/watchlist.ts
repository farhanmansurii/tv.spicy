import { prisma } from './prisma';
import { MediaType } from '@prisma/client';

interface WatchlistItem {
	mediaId: number;
	mediaType: 'movie' | 'tv';
	posterPath?: string | null;
	backdropPath?: string | null;
	title: string;
	overview?: string | null;
}

export async function getWatchlist(userId: string, mediaType?: 'movie' | 'tv') {
	const where: any = { userId };
	if (mediaType) {
		where.mediaType = mediaType.toUpperCase() as MediaType;
	}

	return prisma.watchlist.findMany({
		where,
		orderBy: { addedAt: 'desc' },
	});
}

export async function addToWatchlist(userId: string, item: WatchlistItem) {
	return prisma.watchlist.upsert({
		where: {
			userId_mediaId_mediaType: {
				userId,
				mediaId: item.mediaId,
				mediaType: item.mediaType.toUpperCase() as MediaType,
			},
		},
		update: {},
		create: {
			userId,
			mediaId: item.mediaId,
			mediaType: item.mediaType.toUpperCase() as MediaType,
			posterPath: item.posterPath,
			backdropPath: item.backdropPath,
			title: item.title,
			overview: item.overview,
		},
	});
}

export async function removeFromWatchlist(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
	return prisma.watchlist.deleteMany({
		where: {
			userId,
			mediaId,
			mediaType: mediaType.toUpperCase() as MediaType,
		},
	});
}

export async function clearWatchlist(userId: string, mediaType?: 'movie' | 'tv') {
	const where: any = { userId };
	if (mediaType) {
		where.mediaType = mediaType.toUpperCase() as MediaType;
	}
	return prisma.watchlist.deleteMany({ where });
}

export async function isInWatchlist(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
	const item = await prisma.watchlist.findUnique({
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
