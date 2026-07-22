import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/shared/containers/container';
import { fetchRowData } from '@/lib/api';
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
	let error = false;
	try {
		const data = await fetchRowData(category.endpoint);
		shows = Array.isArray(data) ? (data as Show[]) : [];
	} catch {
		error = true;
	}

	return (
		<main className="min-h-screen bg-background pb-24 pt-[calc(6rem+env(safe-area-inset-top))] text-foreground md:pb-28 md:pt-28">
			<Container>
				<BrowseCollectionHeader
					title={category.title}
					description={category.description}
					count={error ? undefined : shows.length}
				/>

				<section aria-label={`${category.title} titles`} className="mt-6 md:mt-8">
					{error ? (
						<div className="flex min-h-48 items-center justify-center rounded-3xl bg-white/[0.025] px-6 text-center ring-1 ring-inset ring-white/[0.06]">
							<div className="max-w-sm">
								<h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
									Couldn’t load this collection
								</h2>
								<p className="mt-2 text-sm leading-relaxed text-white/42">
									Check your connection and try refreshing the page.
								</p>
							</div>
						</div>
					) : shows.length === 0 ? (
						<div className="flex min-h-48 items-center justify-center rounded-3xl bg-white/[0.025] px-6 text-center ring-1 ring-inset ring-white/[0.06]">
							<div className="max-w-sm">
								<h2 className="text-lg font-semibold tracking-[-0.02em] text-white">
									No titles available
								</h2>
								<p className="mt-2 text-sm text-white/42">
									This collection is empty right now. Check back later.
								</p>
							</div>
						</div>
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
