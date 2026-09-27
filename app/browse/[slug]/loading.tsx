import { Skeleton } from '@/components/ui/skeleton';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

export default function BrowseLoading() {
	return (
		<main className="min-h-screen bg-background pb-24 pt-safe-header text-foreground md:pb-28 md:pt-28">
			<Container>
				<header className="max-w-4xl border-l-2 border-brand pl-5 md:pl-7">
					<Skeleton className="h-3 w-40 rounded-sm" />
					<Skeleton className="mt-3 h-16 w-96 max-w-full rounded-sm md:h-28" />
					<Skeleton className="mt-4 h-5 w-full max-w-md rounded-sm" />
				</header>
			</Container>

			<div className="section-spacing">
				<MediaLoader
					layout="grid"
					isVertical
					itemCount={12}
					className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing overflow-visible"
				/>
			</div>
		</main>
	);
}
