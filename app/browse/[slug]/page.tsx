import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_noStore } from 'next/cache';
import Container from '@/components/shared/containers/container';
import { fetchRowData } from '@/lib/api';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';
import MediaRow from '@/components/features/media/row/media-row';
import { BrowseCollectionHeader } from '@/components/features/media/row/browse-collection-header';
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
		<main className="min-h-screen bg-background pb-24 pt-[calc(6rem+env(safe-area-inset-top))] text-foreground md:pb-28 md:pt-28">
			<Container>
				<BrowseCollectionHeader
					title={category.title}
					description={category.description}
					count={loadFailed ? undefined : shows.length}
				/>

				<section aria-label={`${category.title} titles`} className="mt-6 md:mt-8">
					{loadFailed ? (
						<PageFetchError
							title="Couldn’t load this collection"
							description="Check your connection and try again."
							className="min-h-48 px-0 py-0"
						/>
					) : (
						<MediaRow
							shows={shows}
							type={category.type}
							isVertical
							gridLayout
							hideHeader
						/>
					)}
				</section>
			</Container>
		</main>
	);
}
