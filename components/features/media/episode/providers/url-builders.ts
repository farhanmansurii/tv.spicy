/**
 * Shared URL construction helpers. Registry entries pick one of these instead
 * of writing bespoke buildUrl functions.
 */

import type { EmbedUrls, ProviderMedia, ResumeConfig } from './types';

function enc(value: string | number): string {
	return encodeURIComponent(String(value));
}

/** Append extra query parameters, composing with any existing query string. */
export function withQuery(url: string, params: Record<string, string>): string {
	const qs = new URLSearchParams(params).toString();
	if (!qs) return url;
	return `${url}${url.includes('?') ? '&' : '?'}${qs}`;
}

/** `{base}/embed/movie/{id}` and `{base}/embed/tv/{id}/{season}/{episode}` */
export function standardEmbedUrls(base: string): EmbedUrls {
	return {
		origin: base,
		movie: (id) => `${base}/embed/movie/${enc(id)}`,
		tv: (id, season, episode) => `${base}/embed/tv/${enc(id)}/${enc(season)}/${enc(episode)}`,
	};
}

/** `{base}/movie/{id}` and `{base}/tv/{id}/{season}/{episode}` */
export function pathEmbedUrls(base: string): EmbedUrls {
	return {
		origin: base,
		movie: (id) => `${base}/movie/${enc(id)}`,
		tv: (id, season, episode) => `${base}/tv/${enc(id)}/${enc(season)}/${enc(episode)}`,
	};
}

/** Fully custom routes for providers whose paths fit neither standard shape. */
export function customEmbedUrls(
	origin: string,
	movie: (id: string) => string,
	tv: (id: string, season: number, episode: number) => string
): EmbedUrls {
	return { origin, movie, tv };
}

export { enc as encodeSegment };

/** Declare that a provider resumes via `?{param}=<seconds>`. */
export function queryResume(param: string): ResumeConfig {
	return { param };
}

/**
 * Build the final URL for one provider and one media item. Validates media
 * input; throws on malformed requests so bugs surface instead of rendering an
 * empty iframe.
 */
export function buildUrl(
	urls: EmbedUrls,
	resume: ResumeConfig | undefined,
	media: ProviderMedia
): string {
	const { type, id, seasonNumber, episodeNumber, resumeSeconds } = media;
	if (!id) throw new Error('Provider URL requires a media id');

	let url: string;
	if (type === 'movie') {
		url = urls.movie(id);
	} else if (type === 'tv') {
		const season = Number(seasonNumber);
		const episode = Number(episodeNumber);
		if (!Number.isInteger(season) || season <= 0 || !Number.isInteger(episode) || episode <= 0) {
			throw new Error(`Provider URL requires positive season/episode, got s${seasonNumber}e${episodeNumber}`);
		}
		url = urls.tv(id, season, episode);
	} else {
		throw new Error(`Unknown media type: ${String(type)}`);
	}

	const seconds = Math.floor(resumeSeconds ?? 0);
	if (resume && seconds > 0) {
		url = withQuery(url, { [resume.param]: String(seconds) });
	}
	return url;
}
