import { Skeleton } from '@/components/ui/skeleton';
import Container from '@/components/shared/containers/container';

const tileGrid = 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4';

export default function GenresLoading() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			<Container>
				<section className="section-spacing">
					<Skeleton className="h-3 w-40 rounded-sm" />
					<Skeleton className="mt-3 h-16 w-96 max-w-full rounded-sm md:h-24" />
					<Skeleton className="mt-4 h-5 w-full max-w-xl rounded-sm" />
				</section>

				{[0, 1].map((section) => (
					<section key={section} className="border-t border-border section-spacing">
						<div className="mb-5 flex items-end justify-between gap-3 md:mb-6">
							<div className="flex items-end gap-3">
								<Skeleton className="h-3 w-6 rounded-sm" />
								<Skeleton className="h-8 w-56 rounded-sm md:h-11" />
							</div>
							<Skeleton className="h-3 w-20 rounded-sm" />
						</div>
						<div className={tileGrid}>
							{Array.from({ length: 10 }).map((_, i) => (
								<Skeleton key={i} className="min-h-40 rounded-sm md:min-h-48" />
							))}
						</div>
					</section>
				))}
			</Container>
		</div>
	);
}
