import { Skeleton } from '@/components/ui/skeleton';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

export default function SearchLoading() {
	return (
		<div className="min-h-screen overflow-x-hidden bg-background">
			<div className="sticky top-0 z-40 mt-16 bg-background lg:top-16 lg:bg-transparent">
				<div className="w-full px-gutter pt-2 pb-0">
					<div className="flex h-12 items-center gap-3 rounded-sm border border-border-strong bg-card px-4">
						<Skeleton className="size-5 shrink-0 rounded-full" />
						<Skeleton className="h-4 w-56 rounded-sm" />
						<Skeleton className="ml-auto hidden h-6 w-12 rounded-sm lg:block" />
					</div>
					<div className="mt-6">
						<div className="overflow-x-auto">
							<div className="flex min-w-max gap-6 border-b border-border">
								<span className="relative min-h-11 px-1 pb-3">
									<Skeleton className="h-3 w-17 rounded-sm" />
								</span>
								<span className="relative min-h-11 px-1 pb-3">
									<Skeleton className="h-3 w-13 rounded-sm" />
								</span>
								<span className="relative min-h-11 px-1 pb-3">
									<Skeleton className="h-3 w-16 rounded-sm" />
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Container className="section-spacing">
				<div className="mb-2 w-44">
					<Skeleton className="h-3 w-full rounded-sm" />
				</div>
				<div className="mb-3.5 flex items-end gap-3">
					<Skeleton className="mb-1.25 h-3.5 w-6 shrink-0 rounded-sm" />
					<Skeleton className="h-9 w-36 shrink-0 rounded-sm sm:h-11 sm:w-52" />
				</div>
				<MediaLoader layout="grid" isVertical className="py-0" />
			</Container>
		</div>
	);
}
