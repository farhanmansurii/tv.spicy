import { fetchRowData, fetchTMDBImages, type MediaType } from '@/lib/api/tmdb-client';
import SignInPanel from '@/components/auth/sign-in-panel';

/**
 * Only same-origin relative paths may be used as a post-sign-in redirect.
 * Protocol-relative URLs (`//evil.com`), backslash tricks (`/\evil.com`) and
 * control characters (browsers strip tabs/newlines before URL parsing, turning
 * `/\t/evil.com` into `//evil.com`) are rejected — fall back to the home page
 * so `callbackUrl` can never become an open redirect.
 */
const UNSAFE_CALLBACK = /[\u0000-\u001F\u007F\\]/;

function safeCallbackUrl(value: string | string[] | undefined): string {
	const raw = Array.isArray(value) ? value[0] : value;
	if (!raw || !raw.startsWith('/') || raw.startsWith('//') || UNSAFE_CALLBACK.test(raw)) {
		return '/';
	}
	return raw;
}

/**
 * A scene still from this week's top title. TMDB ranks key art first, so the
 * second textless backdrop is usually a frame from the film rather than a poster.
 */
async function pickBackdropPath(): Promise<string | null> {
	const trending = await fetchRowData('trending/all/week');
	const top = trending.find(
		(item) => item?.backdrop_path && (item.media_type === 'movie' || item.media_type === 'tv')
	);
	if (!top) return null;
	const images = await fetchTMDBImages(String(top.id), top.media_type as MediaType);
	const textless = images?.backdrops?.filter((image) => image.iso_639_1 === null) ?? [];
	return (textless[1] ?? textless[0])?.file_path ?? top.backdrop_path ?? null;
}

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}) {
	const params = await searchParams;
	const callbackUrl = safeCallbackUrl(params.callbackUrl);
	const rawError = Array.isArray(params.error) ? params.error[0] : params.error;
	const errorParam = rawError ?? null;
	const backdropPath = await pickBackdropPath();

	return <SignInPanel backdropPath={backdropPath} callbackUrl={callbackUrl} errorParam={errorParam} />;
}
