import React from 'react';

export function HeroSkeleton() {
	return (
		<section className="relative w-full h-[76dvh] min-h-[560px] max-h-[780px] md:h-[78dvh] md:min-h-[620px] lg:h-[82dvh] bg-background overflow-hidden">
			{/* Backdrop placeholder */}
			<div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
			<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 via-[20%] to-transparent" />

			{/* Content skeleton */}
			<div className="absolute inset-0 z-10 flex flex-col justify-end">
				<div className="mx-auto w-full max-w-[1400px] px-5 pb-12 md:px-8 md:pb-20 lg:px-12 lg:pb-28">
					<div className="max-w-2xl">
						{/* Meta chips */}
						<div className="flex items-center gap-2 mb-5 md:mb-6">
							<div className="h-3.5 w-16 rounded-full bg-white/10 animate-pulse" />
							<div className="h-3.5 w-2 rounded-full bg-white/10 animate-pulse" />
							<div className="h-3.5 w-20 rounded-full bg-white/10 animate-pulse" />
						</div>
						{/* Title */}
						<div className="h-10 md:h-14 w-3/4 rounded-lg bg-white/10 animate-pulse mb-3" />
						<div className="h-10 md:h-14 w-1/2 rounded-lg bg-white/10 animate-pulse mb-6" />
						{/* Actions */}
						<div className="flex items-center gap-3 md:gap-4">
							<div className="h-11 md:h-12 w-28 rounded-full bg-white/15 animate-pulse" />
							<div className="h-11 md:h-12 w-32 rounded-full bg-white/10 animate-pulse" />
							<div className="h-11 md:h-12 w-11 md:w-12 rounded-full bg-white/10 animate-pulse" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export function ShowContainerSkeleton({
	type,
}: {
	type: 'movie' | 'tv';
	seasons?: any[];
}) {
	const isTV = type === 'tv';
	return (
		<section className="section-spacing">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12">
				{/* Header */}
				<div className="mb-5 md:mb-6">
					<div className="h-6 w-24 rounded-lg bg-white/10 animate-pulse mb-2" />
					<div className="h-4 w-48 rounded-md bg-white/[0.06] animate-pulse" />
				</div>

				{/* Season pills */}
				{isTV && (
					<div className="flex items-center gap-2 mb-5 md:mb-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="h-9 w-24 rounded-full bg-white/[0.06] animate-pulse flex-shrink-0"
							/>
						))}
					</div>
				)}

				{/* Desktop: horizontal card skeletons */}
				<div className="hidden md:flex gap-4 overflow-hidden">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="flex-shrink-0 w-[300px] lg:w-[340px]"
						>
							<div className="aspect-[16/10] rounded-2xl bg-white/[0.06] animate-pulse" />
							<div className="h-3.5 w-16 rounded-md bg-white/[0.06] animate-pulse mt-2.5" />
							<div className="h-4 w-3/4 rounded-md bg-white/[0.06] animate-pulse mt-1.5" />
						</div>
					))}
				</div>

				{/* Mobile: list skeletons */}
				<div className="flex md:hidden flex-col gap-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 p-2 rounded-2xl">
							<div className="aspect-video w-28 rounded-xl bg-white/[0.06] animate-pulse flex-shrink-0" />
							<div className="flex-1 space-y-2">
								<div className="h-3 w-12 bg-white/[0.04] rounded" />
								<div className="h-4 w-3/4 bg-white/[0.06] rounded" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function CastCrewSkeleton() {
	return (
		<section className="section-spacing">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12">
				<div className="flex items-center justify-between mb-5 md:mb-6">
					<div className="h-6 w-32 rounded-lg bg-white/10 animate-pulse" />
					<div className="h-5 w-20 rounded-md bg-white/10 animate-pulse" />
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8">
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i}>
							<div className="aspect-[2/3] rounded-2xl bg-white/[0.06] animate-pulse mb-2.5 md:mb-3" />
							<div className="h-3.5 w-20 rounded-md bg-white/[0.06] animate-pulse mb-1.5" />
							<div className="h-3 w-16 rounded-md bg-white/[0.04] animate-pulse" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function VideoSkeleton() {
	return (
		<section className="section-spacing">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12">
				<div className="flex items-center justify-between mb-5 md:mb-6">
					<div className="h-6 w-40 rounded-lg bg-white/10 animate-pulse" />
					<div className="h-5 w-16 rounded-md bg-white/10 animate-pulse" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i}>
							<div className="aspect-video rounded-2xl bg-white/[0.06] animate-pulse" />
							<div className="h-3.5 w-24 rounded-md bg-white/[0.06] animate-pulse mt-2" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function RelatedSkeleton() {
	return (
		<section className="section-spacing">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12">
				<div className="flex items-center justify-between mb-5 md:mb-6">
					<div className="h-6 w-36 rounded-lg bg-white/10 animate-pulse" />
					<div className="flex items-center gap-1 bg-white/[0.06] rounded-full p-1">
						<div className="h-7 w-20 rounded-full bg-white/10 animate-pulse" />
						<div className="h-7 w-20 rounded-full bg-white/10 animate-pulse" />
					</div>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i}>
							<div className="aspect-[2/3] rounded-2xl bg-white/[0.06] animate-pulse mb-2" />
							<div className="h-3.5 w-20 rounded-md bg-white/[0.06] animate-pulse mb-1" />
							<div className="h-3 w-14 rounded-md bg-white/[0.04] animate-pulse" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export function StorylineSkeleton() {
	return (
		<section className="section-spacing">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12">
				<div className="flex items-center justify-between mb-5 md:mb-6">
					<div className="h-6 w-24 rounded-lg bg-white/10 animate-pulse" />
					<div className="h-8 w-20 rounded-full bg-white/10 animate-pulse" />
				</div>
				<div className="space-y-2 max-w-3xl">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="h-4 rounded-md bg-white/[0.06] animate-pulse"
							style={{ width: i === 3 ? '60%' : '100%' }}
						/>
					))}
				</div>
				<div className="flex flex-wrap gap-2 mt-5 md:mt-6">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-7 w-24 rounded-full bg-white/[0.06] animate-pulse"
						/>
					))}
				</div>
			</div>
		</section>
	);
}
