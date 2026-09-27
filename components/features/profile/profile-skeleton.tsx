import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/** Mirrors ProfilePageClient's shape: header card, four stats, then rows. */
export function ProfileSkeleton() {
	return (
		<div className="mt-20 min-h-screen bg-background motion-reduce:[&_[data-slot=skeleton]]:animate-none">
			<div className="px-gutter pt-8 pb-6 md:pt-12 md:pb-8">
				<Card className="p-4 md:p-6 lg:p-10">
					<div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6 lg:gap-8">
						<Skeleton className="size-20 shrink-0 rounded-full md:size-28 lg:size-32" />
						<div className="flex w-full flex-1 flex-col items-center gap-3 md:items-start md:gap-4">
							<Skeleton className="h-8 w-56 rounded-sm md:h-10" />
							<Skeleton className="h-3 w-64 rounded-sm" />
						</div>
						<Skeleton className="h-11 w-32 shrink-0 rounded-full" />
					</div>
				</Card>

				<div className="mt-2 grid grid-cols-2 gap-2 md:mt-4 md:gap-4 lg:grid-cols-4 lg:gap-6">
					{Array.from({ length: 4 }).map((_, index) => (
						<Card key={index} className="p-4 lg:p-6">
							<Skeleton className="h-3 w-24 rounded-sm" />
							<Skeleton className="mt-2 h-7 w-10 rounded-sm" />
						</Card>
					))}
				</div>
			</div>

			<div className="flex flex-col">
				{Array.from({ length: 2 }).map((_, rowIndex) => (
					<section key={rowIndex} className="section-spacing">
						<div className="mb-3.5 flex items-end gap-3 px-gutter md:mb-4">
							<Skeleton className="pb-1.25 h-3 w-6 rounded-sm" />
							<Skeleton className="h-8 w-56 rounded-sm md:h-10" />
							<Skeleton className="hidden pb-1.25 h-3 w-16 rounded-sm sm:block" />
						</div>
						<div className="flex gap-3 overflow-hidden px-(--gutter)">
							{Array.from({ length: 4 }).map((__, cardIndex) => (
								<div
									key={cardIndex}
									className="w-7/10 shrink-0 sm:w-1/2 lg:w-1/3 xl:w-1/4"
								>
									<Skeleton className="aspect-video w-full rounded-sm" />
									<Skeleton className="mt-2.5 h-3.5 w-3/4 rounded-sm" />
									<Skeleton className="mt-1.5 h-2.5 w-1/2 rounded-sm" />
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
