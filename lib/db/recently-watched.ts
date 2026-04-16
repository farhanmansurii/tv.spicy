import { MediaType } from '@prisma/client';

import {
	clampProgress,
	dbRowToContinueWatchingItem,
	mergeContinueWatchingItems,
	sanitizeContinueWatchingItems,
	type ContinueWatchingItem,
	type ContinueWatchingPayload,
} from '@/lib/continue-watching';
import { prisma } from './prisma';

function toMediaType(mediaType: 'movie' | 'tv'): MediaType {
	return mediaType === 'movie' ? MediaType.MOVIE : MediaType.TV;
}

async function listRawRecentlyWatched(userId: string) {
	return prisma.recentlyWatched.findMany({
		where: { userId },
		orderBy: { updatedAt: 'desc' },
	});
}

export async function getRecentlyWatched(
	userId: string,
	limit?: number
): Promise<ContinueWatchingItem[]> {
	const rows = await listRawRecentlyWatched(userId);
	const items = rows
		.map((row) => dbRowToContinueWatchingItem(row))
		.filter((item): item is ContinueWatchingItem => !!item);

	const sanitizedItems = sanitizeContinueWatchingItems(items);
	return typeof limit === 'number' ? sanitizedItems.slice(0, limit) : sanitizedItems;
}

export async function saveRecentlyWatched(
	userId: string,
	item: ContinueWatchingPayload
): Promise<ContinueWatchingItem | null> {
	const mediaType = item.mediaType;
	const mediaId = Number(item.mediaId);

	if (!mediaId || !mediaType) {
		return null;
	}

	const updatedRow = await prisma.$transaction(async (tx) => {
		const existing = await tx.recentlyWatched.findFirst({
			where: {
				userId,
				mediaId,
				mediaType: toMediaType(mediaType),
			},
		});

		if (existing) {
			return tx.recentlyWatched.update({
				where: { id: existing.id },
				data: {
					seasonNumber: item.seasonNumber ?? null,
					episodeNumber: item.episodeNumber ?? null,
					episodeId: item.episodeId ?? null,
					stillPath: item.stillPath ?? null,
					episodeName: item.episodeName ?? null,
					showName: item.showName ?? item.title ?? null,
					progress: clampProgress(item.progressPercent ?? 0),
					updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
				},
			});
		}

		return tx.recentlyWatched.create({
			data: {
				userId,
				mediaId,
				mediaType: toMediaType(mediaType),
				seasonNumber: item.seasonNumber ?? null,
				episodeNumber: item.episodeNumber ?? null,
				episodeId: item.episodeId ?? null,
				stillPath: item.stillPath ?? null,
				episodeName: item.episodeName ?? null,
				showName: item.showName ?? item.title ?? null,
				progress: clampProgress(item.progressPercent ?? 0),
				watchedAt: item.createdAt ? new Date(item.createdAt) : new Date(),
				updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
			},
		});
	});

	return dbRowToContinueWatchingItem(updatedRow);
}

export async function updateWatchProgress(
	userId: string,
	mediaId: number,
	progressPercent: number,
	mediaType: 'movie' | 'tv' = 'tv',
	seasonNumber?: number | null,
	episodeNumber?: number | null
) {
	const existing = await prisma.recentlyWatched.findFirst({
		where: {
			userId,
			mediaId,
			mediaType: toMediaType(mediaType),
		},
	});

	if (!existing) {
		return null;
	}

	const updatedRow = await prisma.recentlyWatched.update({
		where: { id: existing.id },
		data: {
			progress: clampProgress(progressPercent),
			seasonNumber: seasonNumber ?? existing.seasonNumber,
			episodeNumber: episodeNumber ?? existing.episodeNumber,
			updatedAt: new Date(),
		},
	});

	return dbRowToContinueWatchingItem(updatedRow);
}

export async function mergeRecentlyWatchedBatch(
	userId: string,
	items: ContinueWatchingPayload[]
): Promise<ContinueWatchingItem[]> {
	const existingItems = await getRecentlyWatched(userId);
	const mergedItems = mergeContinueWatchingItems(items, existingItems);

	for (const item of mergedItems) {
		await saveRecentlyWatched(userId, item);
	}

	const mergedIds = new Set(mergedItems.map((item) => `${item.mediaType}:${item.mediaId}`));
	const existingRows = await listRawRecentlyWatched(userId);
	const staleIds = existingRows
		.filter((row) => !mergedIds.has(`${row.mediaType.toLowerCase()}:${row.mediaId}`))
		.map((row) => row.id);

	if (staleIds.length > 0) {
		await prisma.recentlyWatched.deleteMany({
			where: {
				id: { in: staleIds },
			},
		});
	}

	return getRecentlyWatched(userId);
}

export async function deleteRecentlyWatched(
	userId: string,
	options?: {
		mediaId?: number;
		mediaType?: 'movie' | 'tv';
	}
) {
	if (options?.mediaId && options.mediaType) {
		return prisma.recentlyWatched.deleteMany({
			where: {
				userId,
				mediaId: options.mediaId,
				mediaType: toMediaType(options.mediaType),
			},
		});
	}

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
			mediaType: MediaType.TV,
		},
	});
}
