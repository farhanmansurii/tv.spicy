import Container from '@/components/shared/containers/container';
import LoadMore from '@/components/features/media/load-more';
import { TitleDisplay } from '@/components/ui/title-display';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// TODO: Cache Components adoption. Interactive paginated route (searchParams); stays dynamic.
export const instant = false;

interface MetadataProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ type?: string; title?: string }>;
}

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
	const { slug } = await props.params;
	const searchParams = await props.searchParams;
	const title = searchParams?.title || 'Discover';
	const type = searchParams?.type?.toLowerCase() === 'movie' ? 'Movies' : 'TV Shows';

	return {
		title: `${title} ${type} | Spicy TV`,
		description: `Explore our curated collection of ${title} ${type.toLowerCase()}.`,
	};
}

interface PageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ type?: string; title?: string }>;
}

export default async function Page(props: PageProps) {
	const { slug } = await props.params;
	const searchParams = await props.searchParams;
	const genreId = slug;
	const title = searchParams?.title;
	const type = searchParams?.type?.toLowerCase() === 'movie' ? 'movie' : 'tv';
	const typeLabel = searchParams?.type?.toLowerCase() === 'movie' ? 'Movies' : 'TV Series';
	const typePlural = type === 'movie' ? 'movies' : 'TV series';

	// Validate required parameters
	if (!title || !searchParams?.type || !genreId) {
		return notFound();
	}

	// Create params object with searchParams that includes id from slug
	const loadMoreParams = {
		params: props.params,
		searchParams: Promise.resolve({
			...searchParams,
			id: genreId,
			type: searchParams.type,
			title: title,
		}),
	};

	return (
		<main className="min-h-screen bg-background pb-24 pt-safe-header text-foreground md:pb-28 md:pt-28">
			<Container>
				<header className="max-w-4xl border-l-2 border-brand pl-5 md:pl-7">
					{/* Same recipe as a media row: accent index, then the label, then
					    the Anton title and the count below. */}
					<div className="flex items-baseline gap-3">
						<span
							aria-hidden="true"
							className="font-mono text-caption leading-none tracking-label text-brand tabular-nums"
						>
							01
						</span>
						<p className="font-mono text-caption uppercase tracking-label text-muted-foreground">
							{typeLabel} / Genre
						</p>
					</div>
					<TitleDisplay title={title} className="mt-3" />
					<p className="mt-4 max-w-prose-secondary text-body leading-relaxed text-muted-foreground">
						A curated selection of {title.toLowerCase()} {typePlural}.
					</p>
				</header>
			</Container>

			{/* LoadMore's grid carries its own gutter, so it stays out of the Container
			    to keep one gutter instead of two. */}
			<section className="border-t border-border section-spacing" aria-label={`${title} ${typeLabel}`}>
				<LoadMore params={loadMoreParams} />
			</section>
		</main>
	);
}
