import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { connection } from 'next/server';
import Container from '@/components/shared/containers/container';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import MediaRow from '@/components/features/media/row/media-row';
import { TitleDisplay } from '@/components/ui/title-display';
import { BROWSE_CATEGORIES, getBrowseCategory } from '@/lib/browse-categories';
import { getCachedRow } from '@/lib/api/catalog-cache';
import type { Show } from '@/lib/types';

export async function generateStaticParams() {
	return Object.keys(BROWSE_CATEGORIES).map((slug) => ({ slug }));
}

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const category = getBrowseCategory(slug);
	return {
		title: category ? `${category.title} | Browse` : 'Browse',
		description: category?.description || 'Browse content',
	};
}

async function BrowseContent({ params }: PageProps) {
	const { slug } = await params;
	const category = getBrowseCategory(slug);
	if (!category) return notFound();

	let shows: Show[] = [];
	try {
		shows = (await getCachedRow(category.endpoint)) as Show[];
	} catch {
		// An outage renders at request time and is never cached.
		await connection();
		return (
			<main className="min-h-screen bg-background pb-24 pt-safe-header text-foreground md:pb-28 md:pt-28">
				<Container>
					<PageFetchError
						title="The projector jammed."
						description="We couldn’t load this collection from the shelf. Check your connection and try again."
						className="min-h-48 px-0 py-0"
					/>
				</Container>
			</main>
		);
	}

	if (shows.length === 0) {
		await connection();
		return (
			<main className="min-h-screen bg-background pb-24 pt-safe-header text-foreground md:pb-28 md:pt-28">
				<Container>
					<PageFetchError
						title="The projector jammed."
						description="We couldn’t load this collection from the shelf. Check your connection and try again."
						className="min-h-48 px-0 py-0"
					/>
				</Container>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background pb-24 pt-safe-header text-foreground md:pb-28 md:pt-28">
			<Container>
				<header className="max-w-4xl border-l-2 border-brand pl-5 md:pl-7">
					{/* Same recipe as a media row: accent index, then the label, then
					    the Anton title and the mono count below. */}
					<div className="flex items-baseline gap-3">
						<span
							aria-hidden="true"
							className="font-mono text-caption leading-none tracking-label text-brand tabular-nums"
						>
							01
						</span>
						<p className="font-mono text-caption uppercase tracking-label text-muted-foreground">
							Curated collection
						</p>
					</div>
					<TitleDisplay title={category.title} className="mt-3" />
					<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
						<p className="max-w-prose-secondary text-body leading-relaxed text-muted-foreground">
							{category.description}
						</p>
						<span className="font-mono text-caption uppercase tracking-meta text-dim tabular-nums">
							{shows.length} {shows.length === 1 ? 'title' : 'titles'}
						</span>
					</div>
				</header>
			</Container>

			{/* The row grid carries its own gutter, so it stays out of the Container
			    to keep one gutter instead of two. */}
			<section aria-label={`${category.title} titles`} className="section-spacing">
				<MediaRow shows={shows} type={category.type} isVertical gridLayout hideHeader />
			</section>
		</main>
	);
}

export default function BrowsePage({ params }: PageProps) {
	return (
		<Suspense
			fallback={
				<MediaLoader withHeader className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />
			}
		>
			<BrowseContent params={params} />
		</Suspense>
	);
}
