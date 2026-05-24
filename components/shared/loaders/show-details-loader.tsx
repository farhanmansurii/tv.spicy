import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Container from '@/components/shared/containers/container';

export default function ShowDetailsLoader() {
	return (
		<section
			className={cn(
				'relative w-full overflow-hidden bg-background',
				'h-[78vh] md:h-[88vh] lg:h-[92vh]'
			)}
		>
			{/* Background skeleton */}
			<div className="absolute inset-0 z-0">
				<Skeleton className="w-full h-full" />
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
				<div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_left_center,rgba(9,9,11,0.8)_0%,transparent_75%)]" />
			</div>

			<div className="relative z-10 h-full flex flex-col justify-end">
				<Container className="pb-12 md:pb-20 lg:pb-28">
					<div className="max-w-4xl flex flex-col items-center md:items-start text-center md:text-left">
						{/* Metadata skeleton */}
						<div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 mb-6 md:mb-8">
							<Skeleton className="h-3 w-14 rounded-sm" />
							<span className="text-white/10">·</span>
							<Skeleton className="h-3 w-20 rounded-sm" />
							<span className="text-white/10">·</span>
							<Skeleton className="h-3 w-10 rounded-sm" />
						</div>

						{/* Title / Logo skeleton */}
						<div className="flex flex-col items-center md:items-start gap-4 md:gap-5 w-full">
							<Skeleton className="h-16 md:h-24 lg:h-32 w-[200px] md:w-[400px] lg:w-[500px] rounded-lg" />
							<Skeleton className="h-4 md:h-5 w-[180px] md:w-[250px] rounded-sm" />
						</div>

						{/* Action buttons skeleton */}
						<div className="flex items-center justify-center md:justify-start gap-3 md:gap-3.5 mt-8 md:mt-12">
							<Skeleton className="h-12 md:h-[52px] w-[140px] md:w-[160px] rounded-full" />
							<Skeleton className="h-11 w-11 md:h-12 md:w-12 rounded-full" />
							<Skeleton className="h-11 w-11 md:h-12 md:w-12 rounded-full" />
						</div>
					</div>
				</Container>
			</div>
		</section>
	);
}
