'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	StarIcon,
	ClockIcon,
	CalendarBlankIcon,
	FilmSlateIcon,
	PencilSimpleIcon,
	UserIcon,
} from '@phosphor-icons/react';
import { tmdbImage } from '@/lib/tmdb-image';
import type { Episode } from '@/lib/types';

interface EpisodeDetailPanelProps {
	episode: Episode | null;
}

const panelVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 200, damping: 26 },
	},
	exit: {
		opacity: 0,
		y: 8,
		transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
	},
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 300, damping: 28 },
	},
};

function EpisodeDetailPanelComponent({ episode }: EpisodeDetailPanelProps) {
	if (!episode) return null;

	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'w780') : null;
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
		profile_path?: string | null;
	}>;
	const director = crew.find((c) => c.job === 'Director');
	const writers = crew.filter(
		(c) => c.job === 'Writer' || c.job === 'Teleplay' || c.job === 'Story'
	);
	const writerNames = writers
		.map((w) => w.name)
		.filter(Boolean)
		.join(', ');

	const guests = (
		(episode.guest_stars ?? []) as Array<{
			name?: string;
			character?: string;
			profile_path?: string | null;
		}>
	).slice(0, 12);

	const epCode = `Season ${episode.season_number}, Episode ${episode.episode_number}`;
	const hasRating = typeof episode.vote_average === 'number' && episode.vote_average > 0;
	const hasRuntime = episode.runtime != null && episode.runtime > 0;

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={episode.id}
				variants={panelVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
				className="w-full"
			>
				{/* Episode still — cinematic hero */}
				{stillUrl && (
					<div className="relative w-full aspect-[21/9] max-h-[280px] overflow-hidden rounded-xl bg-white/[0.04]">
						<img
							src={stillUrl}
							alt={episode.name || `Episode ${episode.episode_number}`}
							loading="lazy"
							className="h-full w-full object-cover"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = 'none';
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
						<div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
					</div>
				)}

				{/* Content */}
				<motion.div
					variants={stagger}
					initial="hidden"
					animate="visible"
					className="flex flex-col gap-4 pt-4"
				>
					{/* Title block */}
					<motion.div variants={fadeUp} className="flex flex-col gap-1.5">
						<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/30">
							{epCode}
						</p>
						<h3 className="text-lg font-bold text-white leading-tight tracking-tight">
							{episode.name || `Episode ${episode.episode_number}`}
						</h3>
					</motion.div>

					{/* Metadata chips */}
					{(hasRating || hasRuntime || airLabel) && (
						<motion.div
							variants={fadeUp}
							className="flex flex-wrap items-center gap-x-3 gap-y-1"
						>
							{hasRating && (
								<span
									className="inline-flex items-center gap-1 text-[12px] font-bold tabular-nums"
									style={{ color: '#FFD60A' }}
								>
									<StarIcon weight="fill" size={10} />
									{(episode.vote_average ?? 0).toFixed(1)}
								</span>
							)}
							{hasRating && (hasRuntime || airLabel) && (
								<span className="text-white/15 text-[9px]">·</span>
							)}
							{hasRuntime && (
								<span className="inline-flex items-center gap-1 text-[12px] text-white/40 tabular-nums">
									<ClockIcon size={10} className="text-white/25" />
									{episode.runtime} min
								</span>
							)}
							{hasRuntime && airLabel && (
								<span className="text-white/15 text-[9px]">·</span>
							)}
							{airLabel && (
								<span className="inline-flex items-center gap-1 text-[12px] text-white/35 tabular-nums">
									<CalendarBlankIcon size={10} className="text-white/20" />
									{airLabel}
								</span>
							)}
						</motion.div>
					)}

					{/* Overview */}
					{episode.overview && (
						<motion.div variants={fadeUp}>
							<p className="text-[13.5px] leading-relaxed text-white/55 max-w-prose">
								{episode.overview}
							</p>
						</motion.div>
					)}

					{/* Crew */}
					{(director?.name || writerNames) && (
						<motion.div
							variants={fadeUp}
							className="flex flex-col sm:flex-row sm:items-start gap-4 pt-3 border-t border-white/[0.06]"
						>
							{director?.name && (
								<div className="flex items-start gap-2.5">
									<FilmSlateIcon
										size={13}
										className="text-white/20 mt-[2px] flex-shrink-0"
									/>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mb-0.5">
											Director
										</p>
										<p className="text-[13px] font-semibold text-white/75">
											{director.name}
										</p>
									</div>
								</div>
							)}
							{writerNames && (
								<div className="flex items-start gap-2.5">
									<PencilSimpleIcon
										size={13}
										className="text-white/20 mt-[2px] flex-shrink-0"
									/>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mb-0.5">
											Written by
										</p>
										<p className="text-[13px] font-semibold text-white/75 leading-snug">
											{writerNames}
										</p>
									</div>
								</div>
							)}
						</motion.div>
					)}

					{/* Guest stars */}
					{guests.length > 0 && (
						<motion.div variants={fadeUp} className="pt-3 border-t border-white/[0.06]">
							<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mb-3">
								Guest Stars
							</p>
							<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
								{guests.map((g, index) => (
									<div
										key={
											g.name
												? `${g.name}-${g.character || ''}`
												: `guest-${index}`
										}
										className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px]"
									>
										{g.profile_path ? (
											<div className="relative w-[72px] h-[96px] rounded-xl overflow-hidden bg-white/[0.04]">
												<img
													src={tmdbImage(g.profile_path, 'w185')}
													alt={g.name || ''}
													loading="lazy"
													className="h-full w-full object-cover"
													onError={(e) => {
														(
															e.currentTarget as HTMLImageElement
														).style.display = 'none';
													}}
												/>
												<div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl pointer-events-none" />
											</div>
										) : (
											<div className="w-[72px] h-[96px] rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
												<span className="text-[10px] font-bold text-white/20">
													{g.name
														?.split(' ')
														.map((n) => n[0])
														.join('')}
												</span>
											</div>
										)}
										<p className="text-[11px] font-medium text-white/55 text-center leading-tight line-clamp-2 w-full">
											{g.name}
										</p>
										{g.character && (
											<p className="text-[9px] text-white/25 text-center leading-tight line-clamp-1 w-full">
												{g.character}
											</p>
										)}
									</div>
								))}
							</div>
						</motion.div>
					)}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

export const EpisodeDetailPanel = memo(EpisodeDetailPanelComponent);
EpisodeDetailPanelComponent.displayName = 'EpisodeDetailPanel';
