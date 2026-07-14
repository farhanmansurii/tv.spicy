/**
 * Local provider endpoint checker. Run with:
 *   node scripts/check-providers.ts [provider-id ...]
 *
 * For every declared provider (or the given IDs), requests the movie and TV
 * routes with representative TMDB IDs and reports DNS result, HTTP status,
 * redirect destination, X-Frame-Options, and CSP framing directives.
 *
 * This checks ENDPOINT HEALTH ONLY. It never labels playback as working —
 * playback confirmation requires the manual browser checklist in
 * docs/superpowers/specs/2026-07-14-provider-registry-redesign.md.
 */

import { PROVIDER_DEFINITIONS } from '../components/features/media/episode/providers/registry';
import { buildUrl } from '../components/features/media/episode/providers/url-builders';

const MOVIE = { type: 'movie' as const, id: '27205' }; // Inception
const TV = { type: 'tv' as const, id: '1399', seasonNumber: 1, episodeNumber: 1 }; // GoT S1E1

interface RouteReport {
	url: string;
	dns: 'ok' | 'failed';
	status?: number;
	finalUrl?: string;
	xFrameOptions?: string;
	cspFraming?: string;
	error?: string;
}

async function checkRoute(url: string): Promise<RouteReport> {
	try {
		const res = await fetch(url, {
			redirect: 'follow',
			signal: AbortSignal.timeout(15_000),
			headers: { 'user-agent': 'Mozilla/5.0 (tv.spicy provider-check; local)' },
		});
		const csp = res.headers.get('content-security-policy') ?? '';
		const framing = csp
			.split(';')
			.map((d) => d.trim())
			.filter((d) => d.startsWith('frame-ancestors') || d.startsWith('frame-src'))
			.join('; ');
		return {
			url,
			dns: 'ok',
			status: res.status,
			finalUrl: res.url !== url ? res.url : undefined,
			xFrameOptions: res.headers.get('x-frame-options') ?? undefined,
			cspFraming: framing || undefined,
		};
	} catch (err) {
		const message =
			err instanceof Error
				? err.cause instanceof Error
					? err.cause.message
					: err.message
				: String(err);
		const dnsFailed = /ENOTFOUND|EAI_AGAIN/.test(message);
		return { url, dns: dnsFailed ? 'failed' : 'ok', error: message };
	}
}

function printRoute(kind: string, r: RouteReport): void {
	const parts = [`  ${kind.padEnd(6)} ${r.url}`];
	if (r.dns === 'failed') parts.push('    DNS: FAILED');
	if (r.error && r.dns === 'ok') parts.push(`    error: ${r.error}`);
	if (r.status !== undefined) parts.push(`    status: ${r.status}`);
	if (r.finalUrl) parts.push(`    redirected to: ${r.finalUrl}`);
	if (r.xFrameOptions) parts.push(`    x-frame-options: ${r.xFrameOptions}`);
	if (r.cspFraming) parts.push(`    csp framing: ${r.cspFraming}`);
	console.log(parts.join('\n'));
}

async function main(): Promise<void> {
	const requested = process.argv.slice(2);
	const targets = requested.length
		? PROVIDER_DEFINITIONS.filter((d) => requested.includes(d.id))
		: PROVIDER_DEFINITIONS;

	const unknown = requested.filter((id) => !PROVIDER_DEFINITIONS.some((d) => d.id === id));
	if (unknown.length) {
		console.error(`Unknown provider id(s): ${unknown.join(', ')}`);
		process.exitCode = 1;
		return;
	}

	for (const def of targets) {
		console.log(
			`\n${def.label} (${def.id}) — status: ${def.status}${def.disabledReason ? ` — ${def.disabledReason}` : ''}`
		);
		const [movieReport, tvReport] = await Promise.all([
			checkRoute(buildUrl(def.urls, undefined, MOVIE)),
			checkRoute(buildUrl(def.urls, undefined, TV)),
		]);
		printRoute('movie', movieReport);
		printRoute('tv', tvReport);
	}

	console.log(
		'\nNote: these results describe endpoint health only. HTTP 200 does not mean playback works; use the manual browser checklist before promoting a provider.'
	);
}

void main();
