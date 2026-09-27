import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_noStore } from 'next/cache';
import Container from '@/components/shared/containers/container';
import { fetchRowData } from '@/lib/api';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';
import MediaRow from '@/components/features/media/row/media-row';
import { TitleDisplay } from '@/components/ui/title-display';
import { getBrowseCategory } from '@/lib/browse-categories';
import type { Show } from '@/lib/types';

export const revalidate = 3600;

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

export default async function BrowsePage({ params }: PageProps) {
	const { slug } = await params;
	const category = getBrowseCategory(slug);
	if (!category) return notFound();

	let shows: Show[] = [];
	let fetchThrew = false;
	try {
		const data = await fetchRowData(category.endpoint);
		shows = Array.isArray(data) ? (data as Show[]) : [];
	} catch {
		fetchThrew = true;
	}

	// fetchRowData swallows upstream failures into [] and these endpoints never
	// legitimately return zero results, so empty means the load failed. Opt out
	// of ISR so the error render is not cached for an hour.
	const loadFailed = fetchThrew || shows.length === 0;
	if (loadFailed) unstable_noStore();

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
						{!loadFailed && (
							<span className="font-mono text-caption uppercase tracking-meta text-dim tabular-nums">
								{shows.length} {shows.length === 1 ? 'title' : 'titles'}
							</span>
						)}
					</div>
				</header>
			</Container>

			{/* The row grid carries its own gutter, so it stays out of the Container
			    to keep one gutter instead of two. */}
			<section aria-label={`${category.title} titles`} className="section-spacing">
				{loadFailed ? (
					<Container>
						<PageFetchError
							title="The projector jammed."
							description="We couldn’t load this collection from the shelf. Check your connection and try again."
							className="min-h-48 px-0 py-0"
						/>
					</Container>
				) : (
					<MediaRow shows={shows} type={category.type} isVertical gridLayout hideHeader />
				)}
			</section>
		</main>
	);
}
