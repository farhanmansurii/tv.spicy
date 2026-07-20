/**
 * Public provider API. Callers use only these three functions plus the types;
 * registry arrays, URL templates, origins, and parsers stay internal.
 */

import { DEFAULT_PROVIDER_ID, PROVIDER_DEFINITIONS, validateRegistry } from './registry';
import type {
	ProviderDefinition,
	ProviderMedia,
	ProviderSummary,
	ResolvedProvider,
} from './types';
import { buildUrl } from './url-builders';
import type { ProgressAdapter, ProgressAdapterId } from './progress/types';
import { parseVidking } from './progress/vidking';
import { parseVidlink } from './progress/vidlink';
import { parseVidsrcFamily } from './progress/vidsrc-family';
import { parseMediaData } from './progress/media-data';
import { parseCineSrc } from './progress/cinesrc';

export type {
	ParsedProgressEvent,
	ProgressAdapter,
	ProgressContext,
} from './progress/types';
export type { ProviderMedia, ProviderSummary, ResolvedProvider } from './types';
export { DEFAULT_PROVIDER_ID } from './registry';

export const PROGRESS_ADAPTERS: Record<ProgressAdapterId, ProgressAdapter> = {
	vidking: parseVidking,
	vidlink: parseVidlink,
	'vidsrc-family': parseVidsrcFamily,
	'media-data': parseMediaData,
	cinesrc: parseCineSrc,
};

if (process.env.NODE_ENV !== 'production') {
	validateRegistry(PROVIDER_DEFINITIONS);
}

const enabledDefinitions = PROVIDER_DEFINITIONS.filter((d) => d.status === 'enabled').sort(
	(a, b) => a.rank - b.rank
);

function toSummary(def: ProviderDefinition): ProviderSummary {
	return {
		id: def.id,
		label: def.label,
		hasResume: Boolean(def.resume),
		hasProgress: Boolean(def.progress),
	};
}

function toResolved(def: ProviderDefinition): ResolvedProvider {
	return {
		id: def.id,
		label: def.label,
		buildUrl: (media: ProviderMedia) => buildUrl(def.urls, def.resume, media),
		...(def.progress ? { progress: def.progress } : {}),
	};
}

/** Providers offered in the manual source selector, in rank order. */
export function listEnabledProviders(): ProviderSummary[] {
	return enabledDefinitions.map(toSummary);
}

/**
 * Resolve a persisted provider ID to an enabled provider. Unknown, candidate,
 * and disabled IDs all fall back to the default (VidCore).
 */
export function resolveProvider(id: string): ResolvedProvider {
	const def =
		enabledDefinitions.find((d) => d.id === id) ??
		enabledDefinitions.find((d) => d.id === DEFAULT_PROVIDER_ID) ??
		enabledDefinitions[0];
	return toResolved(def);
}

/** Build the embed URL for one provider and one media item. */
export function buildProviderUrl(id: string, media: ProviderMedia): string {
	return resolveProvider(id).buildUrl(media);
}

/** Look up the progress adapter for a resolved provider, if it has one. */
export function getProgressAdapter(provider: ResolvedProvider): ProgressAdapter | null {
	if (!provider.progress) return null;
	return PROGRESS_ADAPTERS[provider.progress.adapter] ?? null;
}
