import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import {
	getDetailShow,
	getDetailCredits,
	getDetailRelated,
} from '@/lib/api/detail-cache';
import { fetchRowData } from '@/lib/api';
import { tmdbImage } from '@/lib/tmdb-image';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';
import {
	MediaDetailsShell,
	DetailHero,
	MediaInfoPanel,
	ShowContainer,
	MoreDetailsContainer,
} from '@/components/features/media/details';
import {
	HeroSkeleton,
	ShowContainerSkeleton,
	RelatedSkeleton,
	StorylineSkeleton,
} from '@/components/features/media/details/detail-skeletons';

// Prerender a few real paths so the route has a static shell to validate; all
// other ids serve the shell first and upgrade after their first visit. A TMDB
// outage at build time falls back to a known id instead of breaking the build.
export async function generateStaticParams() {
	const trending = await fetchRowData('trending/movie/week');
	const ids = trending
		.filter((show) => typeof show?.id === 'number')
		.slice(0, 5)
		.map((show) => ({ movie: String(show.id) }));
	return ids.length > 0 ? ids : [{ movie: '550' }];
}

/* ────────────────────────────────────────────────────────────
   Metadata
   ──────────────────────────────────────────────────────────── */
export async function generateMetadata(props: any): Promise<Metadata> {
	const params = await props.params;
	const { movie } = params;

	try {
		const show = await getDetailShow(movie, 'movie');
		if (!show) return { title: 'Movie', description: 'Movie details' };

		const imagePath = show?.backdrop_path || show?.poster_path;
		const imageUrl = imagePath ? tmdbImage(imagePath, 'w1280') : '/icon-512x512.png';
		const title = show?.title || 'Movie';

		return {
			title,
			description: show.overview || undefined,
			alternates: { canonical: `/movie/${movie}` },
			openGraph: {
				title,
				description: show.overview || undefined,
				type: 'video.movie',
				images: [{ url: imageUrl, alt: title }],
			},
			twitter: {
				card: 'summary_large_image',
				title,
				description: show.overview || undefined,
				images: [imageUrl],
			},
		};
	} catch {
		return { title: 'Movie', description: 'Movie details' };
	}
}

/* ────────────────────────────────────────────────────────────
   Async section wrappers — params stay inside the Suspense
   boundary so unknown ids still prerender a static shell.
   ──────────────────────────────────────────────────────────── */
async function DetailMain({ params }: { params: Promise<{ movie: string }> }) {
	const { movie } = await params;

	let show;
	try {
		show = await getDetailShow(movie, 'movie');
	} catch {
		// An outage renders at request time and is never cached; a missing
		// record below resolves to a stable cached 404 via notFound().
		await connection();
		return (
			<PageFetchError
				title="Couldn’t load this title"
				description="We couldn’t reach the catalog. Try again in a moment."
			/>
		);
	}
	if (!show) return notFound();

	return (
		<>
			<DetailHero show={show} type="movie" />
			<ShowContainer showData={show as any} id={String(show.id)} type="movie" />
		</>
	);
}

async function InfoPanelSection({ params }: { params: Promise<{ movie: string }> }) {
	const { movie } = await params;
	const show = await getDetailShow(movie, 'movie').catch(() => null);
	if (!show) return null;
	const credits = await getDetailCredits(movie, 'movie');
	return (
		<MediaInfoPanel
			data={show}
			type="movie"
			credits={credits}
			videos={show.videos?.results || []}
		/>
	);
}

async function RelatedSection({ params }: { params: Promise<{ movie: string }> }) {
	const { movie } = await params;
	const show = await getDetailShow(movie, 'movie').catch(() => null);
	if (!show) return null;
	const { similar, recommendations } = await getDetailRelated(movie, 'movie');
	if (!similar.length && !recommendations.length) return null;
	return <MoreDetailsContainer type="movie" similar={similar} recommendations={recommendations} />;
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */
export default function MovieDetailsPage({
	params,
}: {
	params: Promise<{ movie: string }>;
}) {
	return (
		<MediaDetailsShell>
			<Suspense
				fallback={
					<>
						<HeroSkeleton />
						<ShowContainerSkeleton type="movie" />
					</>
				}
			>
				<DetailMain params={params} />
			</Suspense>

			<Suspense fallback={<StorylineSkeleton />}>
				<InfoPanelSection params={params} />
			</Suspense>

			<Suspense fallback={<RelatedSkeleton />}>
				<RelatedSection params={params} />
			</Suspense>
		</MediaDetailsShell>
	);
}
