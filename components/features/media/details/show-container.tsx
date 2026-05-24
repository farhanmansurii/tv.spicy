'use client';

import React, { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Show } from '@/lib/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TMDBSeason {
	air_date: string;
	episode_count: number;
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	season_number: number;
}

interface ShowContainerProps {
	type: 'movie' | 'tv';
	id: string;
	seasons?: TMDBSeason[];
	showData: Show;
}

const Episode = dynamic(() => import('@/components/features/media/episode/episode'), {
	ssr: false,
	loading: () => (
		<div className="w-full py-8 md:py-12">
			<div className="aspect-video w-full rounded-2xl bg-white/[0.04] animate-pulse" />
		</div>
	),
});

const SeasonTabs = dynamic(() => import('@/components/features/media/seasons/season-tabs'), {
	ssr: false,
	loading: () => (
		<div className="w-full py-8 md:py-12">
			<div className="h-10 w-48 rounded-full bg-white/[0.04] animate-pulse mb-6" />
			<div className="space-y-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="flex gap-3">
						<div className="aspect-video w-36 md:w-44 rounded-xl bg-white/[0.04] animate-pulse flex-shrink-0" />
						<div className="flex-1 space-y-2 py-2">
							<div className="h-4 w-3/4 rounded-md bg-white/[0.04] animate-pulse" />
							<div className="h-3 w-1/2 rounded-md bg-white/[0.03] animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</div>
	),
});

export default function ShowContainer({ type, id, seasons, showData }: ShowContainerProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!contentRef.current) return;

		const ctx = gsap.context(() => {
			gsap.fromTo(
				contentRef.current,
				{ y: 24, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.7,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: contentRef.current,
						start: 'top 85%',
						toggleActions: 'play none none none',
					},
				}
			);
		});

		return () => ctx.revert();
	}, []);

	return (
		<section className="section-spacing">
			<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8">
				<div ref={contentRef}>
					{type === 'tv' ? (
						<SeasonTabs seasons={seasons || []} showId={id} showData={showData} />
					) : (
						<Episode episodeId={''} id={id || ''} movieID={id} type={type} />
					)}
				</div>
			</div>
		</section>
	);
}
