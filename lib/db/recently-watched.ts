import { MediaType, type Prisma } from '@prisma/client';

import {
	clampProgress,
	dbRowToContinueWatchingItem,
	mergeContinueWatchingItems,
	normalizeContinueWatchingItem,
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

async function upsertRecentlyWatchedRow(
	tx: Prisma.TransactionClient,
	userId: string,
	item: ContinueWatchingPayload
) {
	const mediaType = item.mediaType;
	const mediaId = Number(item.mediaId);

	if (!mediaId || !mediaType) {
		return null;
	}

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

	const updatedRow = await prisma.$transaction((tx) => upsertRecentlyWatchedRow(tx, userId, item));
	if (!updatedRow) {
		return null;
	}

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

/**
 * Union-merge an incoming batch into the user's history.
 *
 * Rows absent from `items` are NEVER deleted here: deletion only happens on an
 * explicit user delete request (see deleteRecentlyWatched). The 24-item cap and
 * completion filters are display concerns applied by getRecentlyWatched, not
 * predicates for persistence. Returns the merged row count.
 */
export async function mergeRecentlyWatchedBatch(
	userId: string,
	items: ContinueWatchingPayload[]
): Promise<number> {
	if (items.length === 0) {
		return 0;
	}

	const existingRows = await listRawRecentlyWatched(userId);
	const existingItems = existingRows
		.map((row) => dbRowToContinueWatchingItem(row))
		.filter((item): item is ContinueWatchingItem => !!item);

	const mergedItems = mergeContinueWatchingItems(items, existingItems, { mode: 'persist' });

	const incomingKeys = new Set(
		items
			.map((item) => normalizeContinueWatchingItem(item))
			.filter((item): item is ContinueWatchingItem => !!item)
			.map((item) => item.id)
	);
	const writes = mergedItems.filter((item) => incomingKeys.has(item.id));

	await prisma.$transaction(async (tx) => {
		for (const item of writes) {
			await upsertRecentlyWatchedRow(tx, userId, item);
		}
	});

	return mergedItems.length;
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
