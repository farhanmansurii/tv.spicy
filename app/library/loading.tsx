import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

function StatCardSkeleton() {
	return (
		<Card className="bg-background/40 backdrop-blur-xl border-border/50 p-4">
			<div className="flex items-center gap-3">
				<Skeleton className="h-10 w-10 rounded-xl" />
				<div className="space-y-1.5">
					<Skeleton className="h-6 w-12" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>
		</Card>
	);
}

function SectionSkeleton() {
	return (
		<Card className="bg-background/40 backdrop-blur-xl border-border/50">
			<div className="p-4 md:p-6 space-y-4">
				<Skeleton className="h-5 w-40" />
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i}>
							<Skeleton className="aspect-[2/3] rounded-xl" />
							<Skeleton className="h-3.5 w-20 mt-2" />
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}

export default function LibraryLoading() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			<div className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950 border-b border-white/5">
				<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12 py-10 md:py-14">
					<div className="max-w-4xl space-y-4">
						<Skeleton className="h-3 w-32" />
						<Skeleton className="h-10 md:h-14 w-64" />
						<Skeleton className="h-4 w-3/4 max-w-xl" />
						<Skeleton className="h-9 w-32 rounded-full" />
					</div>
				</div>
			</div>

			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12 py-8 md:py-12">
				<div className="grid gap-3 sm:grid-cols-3 mb-8">
					<StatCardSkeleton />
					<StatCardSkeleton />
					<StatCardSkeleton />
				</div>

				<div className="space-y-8">
					<SectionSkeleton />
					<SectionSkeleton />
					<SectionSkeleton />
				</div>
			</div>
		</div>
	);
}
