import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
	getDetailShow,
	getDetailCredits,
	getDetailRelated,
} from '@/lib/api/detail-cache';
import { tmdbImage } from '@/lib/tmdb-image';
import {
	MediaDetailsShell,
	DetailHero,
	ShowContainer,
	CastCrewSection,
	VideoSection,
	StorylineSection,
	MoreDetailsContainer,
} from '@/components/features/media/details';
import {
	ShowContainerSkeleton,
	CastCrewSkeleton,
	RelatedSkeleton,
} from '@/components/features/media/details/detail-skeletons';

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
   Async section wrappers — each streams independently
   ──────────────────────────────────────────────────────────── */
async function CreditsSection({ id }: { id: string }) {
	const credits = await getDetailCredits(id, 'movie');
	if (!credits?.cast?.length) return null;
	return <CastCrewSection credits={credits} />;
}

async function RelatedSection({ id }: { id: string }) {
	const { similar, recommendations } = await getDetailRelated(id, 'movie');
	if (!similar.length && !recommendations.length) return null;
	return <MoreDetailsContainer type="movie" similar={similar} recommendations={recommendations} />;
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */
export default async function MovieDetailsPage(props: {
	params: Promise<{ movie: string }>;
}) {
	const params = await props.params;
	const { movie } = params;

	// Only block on the show itself — everything else streams
	const show = await getDetailShow(movie, 'movie');
	if (!show) return notFound();

	const showId = String(show.id);
	const hasVideos = show.videos?.results && show.videos.results.length > 0;

	return (
		<MediaDetailsShell>
			<DetailHero show={show} type="movie" />

			<Suspense fallback={<ShowContainerSkeleton type="movie" />}>
				<ShowContainer showData={show as any} id={showId} type="movie" />
			</Suspense>

			<Suspense fallback={<CastCrewSkeleton />}>
				<CreditsSection id={movie} />
			</Suspense>

			{hasVideos && <VideoSection videos={show.videos!.results} />}

			<StorylineSection data={show} type="movie" />

			<Suspense fallback={<RelatedSkeleton />}>
				<RelatedSection id={movie} />
			</Suspense>
		</MediaDetailsShell>
	);
}
