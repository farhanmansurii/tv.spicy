import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import Container from '@/components/shared/containers/container';

export default function ProfileLoading() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			<Container className="py-4 md:py-8 lg:py-12">
				<div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
					{/* Profile header */}
					<Card className="bg-background/40 backdrop-blur-2xl border-border/50 p-4 md:p-6 lg:p-10 relative overflow-hidden">
						<div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 lg:gap-8">
							<div className="relative">
								<Skeleton className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full border-4 border-border/50" />
								<Skeleton className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 md:border-4 border-background" />
							</div>

							<div className="flex-1 text-center md:text-left w-full space-y-3 md:space-y-4">
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
									<div className="space-y-1 md:space-y-2">
										<Skeleton className="h-8 md:h-10 lg:h-12 w-40 md:w-56 mx-auto md:mx-0 rounded-lg" />
										<Skeleton className="h-4 md:h-5 w-48 md:w-64 mx-auto md:mx-0 rounded-md" />
									</div>
									<div className="flex items-center gap-2 justify-center md:justify-end">
										<Skeleton className="h-9 w-28 rounded-lg" />
										<Skeleton className="h-9 w-24 rounded-lg" />
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
									<Skeleton className="h-7 w-32 rounded-full" />
									<Skeleton className="h-7 w-40 rounded-full" />
								</div>
							</div>
						</div>
					</Card>

					{/* Stats grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={i} className="bg-background/40 backdrop-blur-xl border-border/50 p-3 md:p-4 lg:p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 md:gap-3 lg:gap-4">
										<Skeleton className="p-2 md:p-2.5 lg:p-3 rounded-xl h-10 w-10 md:h-12 md:w-12" />
										<div>
											<Skeleton className="h-6 md:h-8 lg:h-10 w-12 rounded-lg mb-0.5 md:mb-1" />
											<Skeleton className="h-3 md:h-4 w-20 rounded-md" />
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>

					{/* Content sections */}
					<div className="space-y-6 md:space-y-8">
						{/* Overview section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-9 w-9 rounded-xl" />
								<Skeleton className="h-6 md:h-7 w-24 rounded-md" />
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
								{Array.from({ length: 5 }).map((_, i) => (
									<Card key={i} className="bg-foreground/[0.03] border-border/50 p-3 md:p-4">
										<Skeleton className="h-5 w-5 mx-auto mb-2 rounded" />
										<Skeleton className="h-6 md:h-8 w-12 mx-auto rounded-lg mb-1" />
										<Skeleton className="h-3 w-16 mx-auto rounded-md" />
									</Card>
								))}
							</div>
						</div>

						{/* Watchlist section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-9 w-9 rounded-xl" />
								<Skeleton className="h-6 md:h-7 w-28 rounded-md" />
							</div>
							<div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
						</div>

						{/* Favorites section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-9 w-9 rounded-xl" />
								<Skeleton className="h-6 md:h-7 w-28 rounded-md" />
							</div>
							<div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
}
