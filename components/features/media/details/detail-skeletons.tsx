import React from 'react';
import { cn } from '@/lib/utils';

export function HeroSkeleton() {
	return (
		<section className="relative isolate flex min-h-screen items-end overflow-hidden px-gutter pt-28 pb-16 md:pt-32 md:pb-20 bg-background">
			{/* Backdrop art skeleton */}
			<div
				className="absolute inset-0 -z-10 overflow-hidden bg-surface shadow-inset-line animate-pulse"
				aria-hidden="true"
			/>

			{/* Shade overlay */}
			<div
				className="pointer-events-none absolute inset-0 -z-5 bg-gradient-to-t from-background via-background/60 to-transparent"
				aria-hidden="true"
			/>

			{/* Back link placeholder */}
			<div className="absolute top-20 left-4 sm:left-6 lg:left-8 z-10 h-5 w-28 rounded-full bg-surface animate-pulse" />

			{/* Content column */}
			<div className="relative z-10 w-full max-w-3xl">
				{/* Overline placeholder */}
				<div className="flex items-center gap-3 mb-4">
					<span className="inline-block w-7 h-0.5 mr-1 bg-brand/50 shrink-0" />
					<div className="h-3.5 w-16 rounded-full bg-surface animate-pulse" />
					<div className="h-3.5 w-12 rounded-full bg-surface animate-pulse" />
					<div className="h-3.5 w-20 rounded-full bg-surface animate-pulse" />
				</div>

				{/* Title placeholder */}
				<div className="h-16 sm:h-20 md:h-24 w-4/5 rounded-sm bg-surface animate-pulse mb-3" />
				<div className="h-10 sm:h-12 md:h-14 w-1/2 rounded-sm bg-surface animate-pulse mb-6" />

				{/* Rating placeholder */}
				<div className="flex items-baseline gap-2.5 mb-4">
					<div className="h-7 w-12 rounded-sm bg-surface animate-pulse" />
					<div className="h-4 w-32 rounded-sm bg-surface animate-pulse" />
				</div>

				{/* Overview placeholder */}
				<div className="flex flex-col gap-2 mb-6 max-w-2xl">
					<div className="h-4 w-full rounded-sm bg-surface animate-pulse" />
					<div className="h-4 w-5/6 rounded-sm bg-surface animate-pulse" />
					<div className="h-4 w-2/3 rounded-sm bg-surface animate-pulse" />
				</div>

				{/* Actions placeholder */}
				<div className="flex items-center gap-3 mt-6">
					<div className="h-12 w-36 rounded-full bg-brand/30 animate-pulse" />
					<div className="h-12 w-32 rounded-full bg-surface animate-pulse" />
					<div className="h-12 w-28 rounded-full bg-surface animate-pulse" />
				</div>
			</div>
		</section>
	);
}

export function EditorialHeroSkeleton() {
	return <HeroSkeleton />;
}

export function AboutSkeleton({ type = 'tv' }: { type?: 'movie' | 'tv' }) {
	const sectionIndex = type === 'tv' ? '02' : '01';

	return (
		<section className="mb-section scroll-mt-8 px-gutter">
			{/* Section Heading */}
			<div className="flex items-end gap-3.5 pb-5 border-b border-line-strong mb-7">
				<span
					className="pb-1 font-mono text-caption uppercase text-brand tracking-label tabular-nums"
					aria-hidden="true"
				>
					{sectionIndex}
				</span>
				<h2 className="text-title text-text">
					About
				</h2>
				<span className="ml-auto pb-1 text-right font-mono text-caption uppercase text-dim tracking-label tabular-nums">
					The people / the picture
				</span>
			</div>

			{/* Tabs skeleton */}
			<div className="flex gap-6 mb-7 border-b border-line pb-3">
				<div className="h-4 w-14 rounded-full bg-surface animate-pulse" />
				<div className="h-4 w-14 rounded-full bg-surface animate-pulse" />
				<div className="h-4 w-16 rounded-full bg-surface animate-pulse" />
			</div>

			{/* Portraits grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-6">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex flex-col pb-4 border-b border-line">
						<div className="aspect-2/3 w-24 mb-3 rounded-sm bg-surface shadow-inset-line animate-pulse" />
						<div className="h-4 w-20 rounded bg-surface animate-pulse mb-1.5" />
						<div className="h-3 w-16 rounded bg-surface animate-pulse" />
					</div>
				))}
			</div>
		</section>
	);
}

export function CastCrewSkeleton() {
	return <AboutSkeleton />;
}

export function StorylineSkeleton() {
	return <AboutSkeleton />;
}

export function ShowContainerSkeleton({
	type,
}: {
	type: 'movie' | 'tv';
	seasons?: any[];
}) {
	const isTV = type === 'tv';
	return (
		<section className="mb-section scroll-mt-8 px-gutter">
			{isTV ? (
				<>
					{/* Episodes Section Heading */}
					<div className="flex items-end gap-3.5 pb-5 border-b border-line-strong mb-7">
						<span
							className="pb-1 font-mono text-caption uppercase text-brand tracking-label tabular-nums"
							aria-hidden="true"
						>
							01
						</span>
						<h2 className="text-title text-text">
							Episodes
						</h2>
					</div>

					{/* Season tabs skeleton */}
					<div className="flex gap-4 mb-7 border-b border-line pb-3">
						<div className="h-8 w-24 rounded-full bg-surface animate-pulse" />
						<div className="h-8 w-24 rounded-full bg-surface animate-pulse" />
					</div>

					{/* Episode rows skeleton */}
					<div className="flex flex-col">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center gap-6 py-4 border-b border-line"
							>
								<div className="h-8 w-8 rounded-sm bg-surface animate-pulse shrink-0" />
								<div className="aspect-video w-36 sm:w-44 rounded-sm bg-surface animate-pulse shrink-0" />
								<div className="flex-1 flex flex-col gap-2">
									<div className="h-4 w-1/3 rounded bg-surface animate-pulse" />
									<div className="h-3 w-2/3 rounded bg-surface animate-pulse" />
								</div>
							</div>
						))}
					</div>
				</>
			) : (
				<div className="w-full py-8">
					<div className="aspect-video w-full rounded-sm bg-surface shadow-inset-line animate-pulse" />
				</div>
			)}
		</section>
	);
}

export function RelatedSkeleton() {
	return (
		<section className="mb-section scroll-mt-8 px-gutter">
			{/* Section Heading */}
			<div className="flex items-end gap-3.5 pb-5 border-b border-line-strong mb-7">
				<span
					className="pb-1 font-mono text-caption uppercase text-brand tracking-label tabular-nums"
					aria-hidden="true"
				>
					03
				</span>
				<h2 className="text-title text-text">
					More like this
				</h2>
			</div>

			{/* Cards scroller skeleton */}
			<div className="flex gap-4 overflow-hidden pb-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="w-36 sm:w-44 md:w-48 shrink-0">
						<div className="aspect-2/3 rounded-sm bg-surface animate-pulse mb-2.5 shadow-inset-line" />
						<div className="h-4 w-3/4 rounded bg-surface animate-pulse mb-1.5" />
						<div className="h-3 w-1/2 rounded bg-surface animate-pulse" />
					</div>
				))}
			</div>
		</section>
	);
}

export function VideoSkeleton() {
	return (
		<section className="mb-section scroll-mt-8 px-gutter">
			<div className="flex items-end gap-3.5 pb-5 border-b border-line-strong mb-7">
				<h2 className="text-title text-text">
					Videos
				</h2>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="aspect-video rounded-sm bg-surface animate-pulse shadow-inset-line"
					/>
				))}
			</div>
		</section>
	);
}
