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
	MediaInfoPanel,
	ShowContainer,
	MoreDetailsContainer,
} from '@/components/features/media/details';
import {
	ShowContainerSkeleton,
	RelatedSkeleton,
	StorylineSkeleton,
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
async function InfoPanelSection({ id, show }: { id: string; show: any }) {
	const credits = await getDetailCredits(id, 'movie');
	return (
		<MediaInfoPanel
			data={show}
			type="movie"
			credits={credits}
			videos={show.videos?.results || []}
		/>
	);
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

	return (
		<MediaDetailsShell>
			<div className="-mt-16 lg:mt-0">
				<DetailHero show={show} type="movie" />
			</div>

			<Suspense fallback={<ShowContainerSkeleton type="movie" />}>
				<ShowContainer showData={show as any} id={showId} type="movie">
					<Suspense fallback={<StorylineSkeleton />}>
						<InfoPanelSection id={movie} show={show} />
					</Suspense>
				</ShowContainer>
			</Suspense>

			<Suspense fallback={<RelatedSkeleton />}>
				<RelatedSection id={movie} />
			</Suspense>
		</MediaDetailsShell>
	);
}
