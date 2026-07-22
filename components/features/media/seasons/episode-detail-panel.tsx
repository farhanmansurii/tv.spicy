'use client';

import { memo } from 'react';
import {
	CalendarBlankIcon,
	ClockIcon,
	FilmSlateIcon,
	PencilSimpleIcon,
	StarIcon,
	UserIcon,
} from '@phosphor-icons/react';
import { tmdbImage } from '@/lib/tmdb-image';
import type { Episode } from '@/lib/types';

interface EpisodeDetailPanelProps {
	episode: Episode | null;
}

function EpisodeDetailPanelComponent({ episode }: EpisodeDetailPanelProps) {
	if (!episode) return null;

	const airLabel = episode.air_date
		? new Date(episode.air_date).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			})
		: null;
	const crew = (episode.crew ?? []) as Array<{
		job?: string;
		name?: string;
	}>;
	const director = crew.find((person) => person.job === 'Director');
	const writerNames = crew
		.filter((person) => ['Writer', 'Teleplay', 'Story'].includes(person.job ?? ''))
		.map((person) => person.name)
		.filter(Boolean)
		.join(', ');
	const guests = (
		(episode.guest_stars ?? []) as Array<{
			name?: string;
			character?: string;
			profile_path?: string | null;
		}>
	).slice(0, 10);
	const hasRating = typeof episode.vote_average === 'number' && episode.vote_average > 0;
	const hasRuntime = episode.runtime != null && episode.runtime > 0;

	return (
		<div className="flex min-w-0 flex-col gap-5">
			<header className="space-y-2">
				<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A84FF]">
					Season {episode.season_number} · Episode {episode.episode_number}
				</p>
				<h3 className="text-xl font-bold leading-tight tracking-[-0.025em] text-white md:text-2xl">
					{episode.name || `Episode ${episode.episode_number}`}
				</h3>
				{(hasRating || hasRuntime || airLabel) && (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/48">
						{hasRating && (
							<span className="inline-flex items-center gap-1 font-semibold text-[#FFD60A] tabular-nums">
								<StarIcon size={12} weight="fill" />
								{episode.vote_average?.toFixed(1)}
							</span>
						)}
						{hasRuntime && (
							<span className="inline-flex items-center gap-1.5 tabular-nums">
								<ClockIcon size={13} /> {episode.runtime} min
							</span>
						)}
						{airLabel && (
							<span className="inline-flex items-center gap-1.5 tabular-nums">
								<CalendarBlankIcon size={13} /> {airLabel}
							</span>
						)}
					</div>
				)}
			</header>

			{episode.overview && (
				<p className="max-w-3xl text-[13.5px] leading-[1.65] text-white/62 md:text-sm">
					{episode.overview}
				</p>
			)}

			{(director?.name || writerNames) && (
				<div className="grid gap-2 sm:grid-cols-2">
					{director?.name && (
						<div className="flex min-h-16 items-center gap-3 rounded-2xl bg-white/[0.035] px-3.5 ring-1 ring-inset ring-white/[0.06]">
							<FilmSlateIcon size={17} className="shrink-0 text-white/30" />
							<div className="min-w-0">
								<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
									Director
								</p>
								<p className="truncate text-[13px] font-semibold text-white/80">
									{director.name}
								</p>
							</div>
						</div>
					)}
					{writerNames && (
						<div className="flex min-h-16 items-center gap-3 rounded-2xl bg-white/[0.035] px-3.5 ring-1 ring-inset ring-white/[0.06]">
							<PencilSimpleIcon size={17} className="shrink-0 text-white/30" />
							<div className="min-w-0">
								<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
									Written by
								</p>
								<p className="line-clamp-2 text-[13px] font-semibold leading-snug text-white/80">
									{writerNames}
								</p>
							</div>
						</div>
					)}
				</div>
			)}

			{guests.length > 0 && (
				<section aria-labelledby="guest-stars-heading">
					<div className="mb-3 flex items-center gap-2">
						<UserIcon size={14} className="text-white/30" />
						<h4
							id="guest-stars-heading"
							className="text-sm font-semibold tracking-[-0.01em] text-white"
						>
							Guest Cast
						</h4>
					</div>
					<div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 scrollbar-none">
						{guests.map((guest, index) => (
							<div
								key={`${guest.name || 'guest'}-${index}`}
								className="w-28 shrink-0 rounded-2xl bg-white/[0.035] p-2 ring-1 ring-inset ring-white/[0.06]"
							>
								<div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/[0.04]">
									{guest.profile_path ? (
										<img
											src={tmdbImage(guest.profile_path, 'w185')}
											alt=""
											loading="lazy"
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center text-xs font-bold text-white/20">
											{guest.name
												?.split(' ')
												.map((part) => part[0])
												.join('')}
										</div>
									)}
								</div>
								<p className="mt-2 truncate text-xs font-semibold text-white/78">
									{guest.name}
								</p>
								{guest.character && (
									<p className="truncate text-[10px] text-white/35">
										{guest.character}
									</p>
								)}
							</div>
						))}
					</div>
				</section>
			)}
		</div>
	);
}

export const EpisodeDetailPanel = memo(EpisodeDetailPanelComponent);
EpisodeDetailPanelComponent.displayName = 'EpisodeDetailPanel';
