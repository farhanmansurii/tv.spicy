import type { Episode } from '@/lib/types';

export type ContinueWatchingMediaType = 'movie' | 'tv';

export interface ContinueWatchingItem {
	id: string;
	mediaId: number;
	mediaType: ContinueWatchingMediaType;
	title: string;
	showName: string;
	episodeName: string;
	episodeId: number | null;
	seasonNumber: number | null;
	episodeNumber: number | null;
	stillPath: string | null;
	progressPercent: number;
	lastPositionSeconds?: number | null;
	durationSeconds?: number | null;
	updatedAt: string;
	createdAt: string;
}

export interface ContinueWatchingPayload {
	mediaId: number;
	mediaType: ContinueWatchingMediaType;
	title?: string | null;
	showName?: string | null;
	episodeName?: string | null;
	episodeId?: number | null;
	seasonNumber?: number | null;
	episodeNumber?: number | null;
	stillPath?: string | null;
	progressPercent?: number;
	lastPositionSeconds?: number | null;
	durationSeconds?: number | null;
	updatedAt?: string;
	createdAt?: string;
}

export function getContinueWatchingId(
	mediaType: ContinueWatchingMediaType,
	mediaId: number
): string {
	return `${mediaType}:${mediaId}`;
}

export function clampProgress(progress: number | null | undefined): number {
	if (!Number.isFinite(progress)) {
		return 0;
	}

	return Math.max(0, Math.min(100, Math.round(progress as number)));
}

export function isContinueWatchingCandidate(progressPercent: number): boolean {
	return progressPercent >= 3 && progressPercent < 95;
}

export function compareByUpdatedAtDesc(
	a: Pick<ContinueWatchingItem, 'updatedAt' | 'createdAt'>,
	b: Pick<ContinueWatchingItem, 'updatedAt' | 'createdAt'>
): number {
	const aTime = new Date(a.updatedAt || a.createdAt).getTime();
	const bTime = new Date(b.updatedAt || b.createdAt).getTime();
	return bTime - aTime;
}

function getTimestamp(item: Pick<ContinueWatchingItem, 'updatedAt' | 'createdAt'>): number {
	return new Date(item.updatedAt || item.createdAt).getTime();
}

export function normalizeContinueWatchingItem(
	item: ContinueWatchingPayload
): ContinueWatchingItem | null {
	if (!item.mediaId || !item.mediaType) {
		return null;
	}

	const now = new Date().toISOString();
	const mediaType = item.mediaType;
	const mediaId = Number(item.mediaId);
	const title = (item.title || item.showName || '').trim();
	const showName = (item.showName || item.title || '').trim();
	const progressPercent = clampProgress(item.progressPercent);

	if (!title && mediaType === 'movie') {
		return null;
	}

	return {
		id: getContinueWatchingId(mediaType, mediaId),
		mediaId,
		mediaType,
		title: title || showName || `Title ${mediaId}`,
		showName: showName || title || `Title ${mediaId}`,
		episodeName: (item.episodeName || '').trim(),
		episodeId:
			typeof item.episodeId === 'number' && Number.isFinite(item.episodeId)
				? item.episodeId
				: null,
		seasonNumber:
			typeof item.seasonNumber === 'number' && Number.isFinite(item.seasonNumber)
				? item.seasonNumber
				: null,
		episodeNumber:
			typeof item.episodeNumber === 'number' && Number.isFinite(item.episodeNumber)
				? item.episodeNumber
				: null,
		stillPath: item.stillPath || null,
		progressPercent,
		lastPositionSeconds:
			typeof item.lastPositionSeconds === 'number' && Number.isFinite(item.lastPositionSeconds)
				? Math.max(0, item.lastPositionSeconds)
				: null,
		durationSeconds:
			typeof item.durationSeconds === 'number' && Number.isFinite(item.durationSeconds)
				? Math.max(0, item.durationSeconds)
				: null,
		updatedAt: item.updatedAt || now,
		createdAt: item.createdAt || item.updatedAt || now,
	};
}

export function mergeContinueWatchingItems(
	localItems: ContinueWatchingPayload[],
	remoteItems: ContinueWatchingPayload[]
): ContinueWatchingItem[] {
	const merged = new Map<string, ContinueWatchingItem>();

	for (const rawItem of [...remoteItems, ...localItems]) {
		const normalized = normalizeContinueWatchingItem(rawItem);
		if (!normalized) {
			continue;
		}

		const existing = merged.get(normalized.id);
		if (!existing) {
			merged.set(normalized.id, normalized);
			continue;
		}

		const existingTime = getTimestamp(existing);
		const normalizedTime = getTimestamp(normalized);
		const newer = existingTime >= normalizedTime ? existing : normalized;
		const older = newer === existing ? normalized : existing;

		merged.set(newer.id, {
			...older,
			...newer,
			progressPercent: clampProgress(
				existingTime === normalizedTime
					? Math.max(existing.progressPercent, normalized.progressPercent)
					: newer.progressPercent
			),
		});
	}

	return sanitizeContinueWatchingItems(Array.from(merged.values()));
}

export function sanitizeContinueWatchingItems(
	items: ContinueWatchingPayload[],
	options: { limit?: number } = {}
): ContinueWatchingItem[] {
	const limit = options.limit ?? 24;

	return items
		.map((item) =>
			'mediaId' in item && 'mediaType' in item
				? normalizeContinueWatchingItem(item)
				: null
		)
		.filter((item): item is ContinueWatchingItem => !!item)
		.filter((item) =>
			item.mediaType === 'tv'
				? item.progressPercent < 95
				: isContinueWatchingCandidate(item.progressPercent)
		)
		.sort(compareByUpdatedAtDesc)
		.filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index)
		.slice(0, limit);
}

export function episodeToContinueWatchingPayload(
	episode: Episode,
	existingItem?: ContinueWatchingItem | null
): ContinueWatchingItem {
	const now = new Date().toISOString();
	const isSameEpisode =
		existingItem?.episodeId === episode.id &&
		existingItem?.seasonNumber === episode.season_number &&
		existingItem?.episodeNumber === episode.episode_number;

	return {
		id: getContinueWatchingId('tv', Number(episode.tv_id)),
		mediaId: Number(episode.tv_id),
		mediaType: 'tv',
		title: (episode.show_name || '').trim() || `Show ${episode.tv_id}`,
		showName: (episode.show_name || '').trim() || `Show ${episode.tv_id}`,
		episodeName: (episode.name || '').trim(),
		episodeId: episode.id ?? null,
		seasonNumber: episode.season_number ?? null,
		episodeNumber: episode.episode_number ?? null,
		stillPath: episode.still_path ?? null,
		progressPercent: isSameEpisode ? clampProgress(existingItem?.progressPercent) : 0,
		updatedAt: now,
		createdAt: existingItem?.createdAt || now,
	};
}

export function dbRowToContinueWatchingItem(row: {
	mediaId: number;
	mediaType: 'MOVIE' | 'TV';
	seasonNumber: number | null;
	episodeNumber: number | null;
	episodeId: number | null;
	stillPath: string | null;
	episodeName: string | null;
	showName: string | null;
	progress: number;
	updatedAt: Date;
	watchedAt: Date;
}): ContinueWatchingItem | null {
	return normalizeContinueWatchingItem({
		mediaId: row.mediaId,
		mediaType: row.mediaType.toLowerCase() as ContinueWatchingMediaType,
		title: row.showName || row.episodeName || `Title ${row.mediaId}`,
		showName: row.showName || row.episodeName || `Title ${row.mediaId}`,
		episodeName: row.episodeName,
		episodeId: row.episodeId,
		seasonNumber: row.seasonNumber,
		episodeNumber: row.episodeNumber,
		stillPath: row.stillPath,
		progressPercent: row.progress,
		updatedAt: row.updatedAt.toISOString(),
		createdAt: row.watchedAt.toISOString(),
	});
}
