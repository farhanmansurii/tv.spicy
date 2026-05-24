import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function ProfileLoading() {
	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12 py-8 md:py-12">
				{/* Profile header */}
				<div className="flex items-center gap-4 md:gap-6 mb-10">
					<Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-7 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>

				{/* Settings cards */}
				<div className="grid gap-4 md:grid-cols-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i} className="bg-background/40 backdrop-blur-xl border-border/50 p-4 md:p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-3.5 w-48" />
								</div>
								<Skeleton className="h-8 w-14 rounded-full" />
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
