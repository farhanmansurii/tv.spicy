'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Show } from '@/lib/types';

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
	children?: React.ReactNode;
}

const Episode = dynamic(() => import('@/components/features/media/episode/episode'), {
	ssr: false,
	loading: () => (
		<div className="w-full py-8 md:py-12">
			<div className="aspect-video w-full rounded-sm bg-card" />
		</div>
	),
});

const SeasonTabs = dynamic(() => import('@/components/features/media/seasons/season-tabs'), {
	ssr: false,
	loading: () => (
		<div className="w-full py-8 md:py-12">
			<div className="mb-6 h-10 w-48 rounded-full bg-card" />
			<div className="flex flex-col gap-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="flex gap-3">
						<div className="aspect-video w-36 shrink-0 rounded-sm bg-card md:w-44" />
						<div className="flex-1 flex flex-col gap-2 py-2">
							<div className="h-4 w-3/4 rounded-sm bg-card" />
							<div className="h-3 w-1/2 rounded-sm bg-band" />
						</div>
					</div>
				))}
			</div>
		</div>
	),
});

export default function ShowContainer({
	type,
	id,
	seasons,
	showData,
	children,
}: ShowContainerProps) {
	const mediaTitle = showData.title || showData.name || 'Untitled';

	return (
		<section className="section-spacing">
			<div className="w-full px-gutter">
				<div>
					{type === 'tv' ? (
						<SeasonTabs
							seasons={seasons || []}
							showId={id}
							showData={showData}
							detailsPanel={children}
						/>
					) : (
						<div className="flex flex-col gap-4 md:gap-6">
							{children}
							<div id="media-player" data-player-container className="scroll-mt-24">
								<Episode
								episodeId={''}
								id={id || ''}
								movieID={id}
								type={type}
								title={mediaTitle}
							/>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
