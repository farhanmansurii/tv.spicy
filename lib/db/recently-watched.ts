import { prisma } from './prisma';
import { MediaType } from '@prisma/client';

interface RecentlyWatchedItem {
	mediaId: number;
	mediaType: 'movie' | 'tv';
	seasonNumber?: number | null;
	episodeNumber?: number | null;
	episodeId?: number | null;
	stillPath?: string | null;
	episodeName?: string | null;
	showName?: string | null;
	progress?: number;
}

export async function getRecentlyWatched(userId: string, limit?: number) {
	return prisma.recentlyWatched.findMany({
		where: { userId },
		orderBy: { updatedAt: 'desc' },
		take: limit,
	});
}

export async function addRecentlyWatched(userId: string, item: RecentlyWatchedItem) {
	// For TV shows, remove other episodes from the same show to keep only the latest
	if (item.mediaType === 'tv' && item.mediaId) {
		await prisma.recentlyWatched.deleteMany({
			where: {
				userId,
				mediaId: item.mediaId,
				mediaType: MediaType.TV,
			},
		});
	}

	return prisma.recentlyWatched.create({
		data: {
			userId,
			mediaId: item.mediaId,
			mediaType: item.mediaType.toUpperCase() as MediaType,
			seasonNumber: item.seasonNumber,
			episodeNumber: item.episodeNumber,
			episodeId: item.episodeId,
			stillPath: item.stillPath,
			episodeName: item.episodeName,
			showName: item.showName,
			progress: item.progress || 0,
		},
	});
}

export async function updateWatchProgress(
	userId: string,
	mediaId: number,
	progress: number,
	seasonNumber?: number,
	episodeNumber?: number
) {
	const where: any = {
		userId,
		mediaId,
	};

	if (seasonNumber !== undefined && episodeNumber !== undefined) {
		where.seasonNumber = seasonNumber;
		where.episodeNumber = episodeNumber;
	}

	return prisma.recentlyWatched.updateMany({
		where,
		data: { progress, updatedAt: new Date() },
	});
}

export async function deleteRecentlyWatched(userId: string) {
	return prisma.recentlyWatched.deleteMany({
		where: { userId },
	});
}

export async function getEpisodeProgress(
	userId: string,
	mediaId: number,
	seasonNumber: number,
	episodeNumber: number
) {
	return prisma.recentlyWatched.findFirst({
		where: {
			userId,
			mediaId,
			seasonNumber,
			episodeNumber,
		},
	});
}
