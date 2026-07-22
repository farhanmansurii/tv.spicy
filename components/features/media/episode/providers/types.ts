/**
 * Shared types for the provider registry.
 *
 * Providers are declared as compact data in `registry.ts`. Callers never see
 * these declarations directly — they go through the public API in `index.ts`.
 */

import type { ProgressAdapterId } from './progress/types';

export type ProviderStatus = 'enabled' | 'candidate' | 'disabled';

export interface ProviderMedia {
	type: 'movie' | 'tv';
	id: string;
	seasonNumber?: number;
	episodeNumber?: number;
	/** Seconds to resume from. 0 or undefined means start from the beginning. */
	resumeSeconds?: number;
}

/**
 * What has actually been verified for a provider, and when. HTTP reachability
 * is recorded separately from playback: a 200 response never implies that
 * media played inside this application's iframe.
 */
export interface ProviderVerification {
	/** ISO date of the last check. */
	checkedAt: string;
	movieRoute: 'reachable' | 'unreachable' | 'blocked';
	tvRoute: 'reachable' | 'unreachable' | 'blocked';
	/** Only 'confirmed' after a browser test from the application origin. */
	playback: 'confirmed' | 'pending' | 'failed';
}

/** Movie/TV embed URL construction for one provider. */
export interface EmbedUrls {
	/** HTTPS origin of the embed pages, used for registry validation. */
	origin: string;
	movie: (id: string) => string;
	tv: (id: string, season: number, episode: number) => string;
}

/** Resume support: which query parameter carries the start position. */
export interface ResumeConfig {
	param: string;
}

/** postMessage progress support: expected origin plus a named adapter. */
export interface ProgressConfig {
	/**
	 * Exact origin the provider posts events from. It may differ from the embed origin.
	 */
	origin: string;
	adapter: ProgressAdapterId;
}

export interface ProviderDefinition {
	id: string;
	label: string;
	status: ProviderStatus;
	/** Selector position among enabled providers. Must be unique. */
	rank: number;
	urls: EmbedUrls;
	resume?: ResumeConfig;
	progress?: ProgressConfig;
	/** Required for enabled providers. */
	verification?: ProviderVerification;
	/** Required for disabled providers. */
	disabledReason?: string;
}

/** What the source selector sees. Capabilities are derived, never hand-written. */
export interface ProviderSummary {
	id: string;
	label: string;
	hasResume: boolean;
	hasProgress: boolean;
}

/** A fully usable enabled provider handed to the player and progress hook. */
export interface ResolvedProvider {
	id: string;
	label: string;
	buildUrl: (media: ProviderMedia) => string;
	progress?: ProgressConfig;
}
