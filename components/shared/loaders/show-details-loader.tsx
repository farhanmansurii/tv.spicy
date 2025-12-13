import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShowDetailsLoader() {
	return (
		<div className="w-full animate-in fade-in duration-500">
			<div className="relative w-full aspect-[2/3] md:aspect-[16/8] overflow-hidden md:rounded-[32px] bg-black shadow-2xl ring-1 ring-white/10">
				{/* Background Image Skeleton */}
				<div className="absolute inset-0 z-0">
					<Skeleton className="w-full h-full bg-muted" />
					<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent md:via-transparent" />
					<div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
				</div>

				{/* Content */}
				<div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 lg:px-12 lg:py-10">
					<div className="max-w-3xl flex flex-col items-start gap-6">
						{/* Logo/Title Skeleton */}
						<Skeleton className="h-12 md:h-16 lg:h-20 w-64 md:w-80 lg:w-96 mb-2 bg-muted" />

						{/* Metadata Row */}
						<div className="flex flex-wrap items-center gap-3">
							<Skeleton className="h-6 w-20 rounded bg-muted" />
							<Skeleton className="h-4 w-12 rounded-full bg-muted" />
							<Skeleton className="h-4 w-16 rounded-full bg-muted" />
							<Skeleton className="h-4 w-12 rounded-full bg-muted" />
							<Skeleton className="h-4 w-8 rounded-full bg-muted" />
						</div>

						{/* Next Episode Skeleton (optional) */}
						<div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-lg p-3 pr-5 w-full md:w-auto">
							<Skeleton className="h-10 w-10 rounded-full shrink-0 bg-muted" />
							<div className="flex flex-col gap-2">
								<Skeleton className="h-3 w-24 bg-muted" />
								<Skeleton className="h-4 w-48 bg-muted" />
							</div>
						</div>

						{/* Overview Skeleton */}
						<div className="space-y-2 max-w-2xl">
							<Skeleton className="h-4 w-full bg-muted" />
							<Skeleton className="h-4 w-full bg-muted" />
							<Skeleton className="h-4 w-3/4 bg-muted" />
						</div>

						{/* Action Buttons */}
						<div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
							<Skeleton className="h-10 md:h-12 w-32 md:w-40 rounded-full bg-muted" />
							<Skeleton className="h-10 md:h-12 w-32 md:w-36 rounded-full bg-muted" />
							<Skeleton className="h-10 md:h-12 w-10 md:w-12 rounded-full bg-muted" />
						</div>

						{/* Genres */}
						<div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-4 w-20 rounded bg-muted" />
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
