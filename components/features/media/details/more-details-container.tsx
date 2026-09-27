'use client';

import React, { memo, useEffect, useMemo, useRef } from 'react';
import MediaCard from '@/components/features/media/card/media-card';
import type { Show } from '@/lib/types';

interface MoreDetailsContainerProps {
	type: string;
	similar: any[];
	recommendations: any[];
}

function MoreDetailsContainerComponent({
	type,
	similar,
	recommendations,
}: MoreDetailsContainerProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const headRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLUListElement>(null);

	const items = useMemo(() => {
		const combined = [...(recommendations || []), ...(similar || [])];
		const seen = new Set<number>();
		const unique: Show[] = [];

		for (const item of combined) {
			if (!item || !item.id || seen.has(item.id)) continue;
			seen.add(item.id);
			unique.push(item);
			if (unique.length >= 12) break;
		}

		return unique;
	}, [recommendations, similar]);

	useEffect(() => {
		if (!sectionRef.current) return;
		sectionRef.current.classList.add('dv-section');
		headRef.current?.classList.add('dv-head');
		trackRef.current?.classList.add('row-track');
	}, []);

	if (items.length === 0) return null;

	const sectionIndex = type === 'tv' ? '03' : '02';

	return (
		<section
			ref={sectionRef}
			id="related"
			aria-labelledby="related-title"
			className="px-gutter mb-20 md:mb-28 scroll-mt-8"
		>
			{/* Section Heading */}
			<div
				ref={headRef}
				className="flex items-end gap-3.5 pb-5 border-b border-line-strong mb-7"
			>
				<span
					className="pb-1 font-mono text-caption uppercase text-brand tracking-label tabular-nums"
					aria-hidden="true"
				>
					{sectionIndex}
				</span>
				<h2
					id="related-title"
					className="font-display text-display-2 uppercase tracking-normal text-text text-balance"
				>
					More like this
				</h2>
				<span className="ml-auto pb-1 text-right font-mono text-caption uppercase text-dim tracking-label tabular-nums">
					{items.length} titles
				</span>
			</div>

			{/* Horizontal Scroller of Editorial Poster Cards */}
			<div className="relative w-full overflow-hidden">
				<ul
					ref={trackRef}
					className="flex gap-4 overflow-x-auto scrollbar-none pb-4 mask-fade-right"
				>
					{items.map((show, index) => (
						<li key={show.id} className="w-36 sm:w-44 md:w-48 shrink-0">
							<MediaCard
								index={index}
								show={show}
								isVertical={true}
								type={type as 'movie' | 'tv'}
								variant="editorial"
							/>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

export default memo(MoreDetailsContainerComponent);
MoreDetailsContainerComponent.displayName = 'MoreDetailsContainer';
