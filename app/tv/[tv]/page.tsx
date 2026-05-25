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
	const { tv } = params;

	try {
		const show = await getDetailShow(tv, 'tv');
		if (!show) return { title: 'TV Show', description: 'TV show details' };

		const imagePath = show?.backdrop_path || show?.poster_path;
		const imageUrl = imagePath ? tmdbImage(imagePath, 'w1280') : '/icon-512x512.png';
		const title = show?.name || 'TV Show';

		return {
			title,
			description: show.overview || undefined,
			alternates: { canonical: `/tv/${tv}` },
			openGraph: {
				title,
				description: show.overview || undefined,
				type: 'video.tv_show',
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
		return { title: 'TV Show', description: 'TV show details' };
	}
}

/* ────────────────────────────────────────────────────────────
   Async section wrappers — each streams independently
   ──────────────────────────────────────────────────────────── */
async function InfoPanelSection({ id, show }: { id: string; show: any }) {
	const credits = await getDetailCredits(id, 'tv');
	return (
		<MediaInfoPanel
			data={show}
			type="tv"
			credits={credits}
			videos={show.videos?.results || []}
		/>
	);
}

async function RelatedSection({ id }: { id: string }) {
	const { similar, recommendations } = await getDetailRelated(id, 'tv');
	if (!similar.length && !recommendations.length) return null;
	return <MoreDetailsContainer type="tv" similar={similar} recommendations={recommendations} />;
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */
export default async function TVDetailsPage(props: {
	params: Promise<{ tv: string }>;
}) {
	const params = await props.params;
	const { tv } = params;

	// Only block on the show itself — everything else streams
	const show = await getDetailShow(tv, 'tv');
	if (!show) return notFound();

	const showId = String(show.id);

	return (
		<MediaDetailsShell>
			<DetailHero show={show} type="tv" />

			<Suspense fallback={<ShowContainerSkeleton type="tv" seasons={(show as any).seasons} />}>
				<ShowContainer showData={show as any} id={showId} type="tv" seasons={(show as any).seasons || []}>
					<Suspense fallback={<StorylineSkeleton />}>
						<InfoPanelSection id={tv} show={show} />
					</Suspense>
				</ShowContainer>
			</Suspense>

			<Suspense fallback={<RelatedSkeleton />}>
				<RelatedSection id={tv} />
			</Suspense>
		</MediaDetailsShell>
	);
}
