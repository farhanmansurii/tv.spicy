// Deep-link ?season=&episode= values are raw URL strings; they are parsed and
// bounded before they reach the player or write to watch history.

export const MAX_SEASON_NUMBER = 500;
export const MAX_EPISODE_NUMBER = 999;

function parseBoundedInt(raw: string | null, min: number, max: number): number | null {
	if (!raw || !/^\d+$/.test(raw)) return null;
	const value = Number.parseInt(raw, 10);
	if (!Number.isSafeInteger(value) || value < min || value > max) return null;
	return value;
}

export function parseSeasonParam(
	raw: string | null,
	knownSeasons?: readonly number[] | null
): number | null {
	const value = parseBoundedInt(raw, 1, MAX_SEASON_NUMBER);
	if (value === null) return null;
	if (knownSeasons && knownSeasons.length > 0 && !knownSeasons.includes(value)) return null;
	return value;
}

export function parseEpisodeParam(
	raw: string | null,
	knownEpisodeCount?: number | null
): number | null {
	const value = parseBoundedInt(raw, 1, MAX_EPISODE_NUMBER);
	if (value === null) return null;
	if (knownEpisodeCount != null && knownEpisodeCount > 0 && value > knownEpisodeCount) {
		return null;
	}
	return value;
}
