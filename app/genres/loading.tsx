import { Skeleton } from '@/components/ui/skeleton';

export default function GenresLoading() {
	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12 py-8 md:py-12">
				<Skeleton className="h-8 w-48 mb-8" />
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
					{Array.from({ length: 20 }).map((_, i) => (
						<Skeleton key={i} className="aspect-[16/9] rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}
