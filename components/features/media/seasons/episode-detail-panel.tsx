'use client';

import { memo } from 'react';
import Image from 'next/image';
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
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 180, damping: 24 },
	},
	exit: {
		opacity: 0,
		y: 10,
		transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
	},
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 280, damping: 26 },
	},
};

function EpisodeDetailPanelComponent({ episode }: EpisodeDetailPanelProps) {
	if (!episode) return null;

	const stillUrl = episode.still_path ? tmdbImage(episode.still_path, 'original') : null;
	const airLabel = episode.air_date
		? new Date(episode.air_date).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
		  })
		: null;

	const crew = (episode.crew ?? []) as Array<{ job?: string; name?: string; profile_path?: string | null }>;
	const director = crew.find((c) => c.job === 'Director');
	const writers = crew.filter((c) => c.job === 'Writer' || c.job === 'Teleplay' || c.job === 'Story');
	const writerNames = writers.map((w) => w.name).filter(Boolean).join(', ');

	const guests = (
		(episode.guest_stars ?? []) as Array<{ name?: string; character?: string; profile_path?: string | null }>
	).slice(0, 10);

	const epCode = `S${String(episode.season_number).padStart(2, '0')} · E${String(episode.episode_number).padStart(2, '0')}`;
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
				className="w-full rounded-2xl overflow-hidden"
				style={{
					background: 'rgba(18,18,20,0.85)',
					border: '1px solid rgba(255,255,255,0.07)',
					backdropFilter: 'blur(32px) saturate(140%)',
					boxShadow:
						'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7)',
				}}
			>
				{/* ── Cinematic Hero ── */}
				{stillUrl ? (
					<div className="relative w-full overflow-hidden" style={{ aspectRatio: '21/9' }}>
						<motion.div
							className="absolute inset-0"
							initial={{ scale: 1.05 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
						>
							<Image
								src={stillUrl}
								alt={episode.name || `Episode ${episode.episode_number}`}
								fill
								loading="lazy"
								sizes="(max-width: 1024px) 100vw, 60vw"
								className="object-cover"
							/>
						</motion.div>

						{/* Multi-layer gradient system */}
						<div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-black/30 to-transparent" />
						<div className="absolute inset-0 bg-gradient-to-r from-[#121214]/80 via-black/20 to-transparent" />
						{/* Edge vignette */}
						<div
							className="absolute inset-0 pointer-events-none"
							style={{
								boxShadow: 'inset 0 0 80px rgba(0,0,0,0.55)',
							}}
						/>

						{/* Episode code — top left */}
						<motion.div
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.14, type: 'spring', stiffness: 320, damping: 26 }}
							className="absolute top-4 left-5"
						>
							<span
								className="text-[9px] font-black uppercase tracking-[0.22em] tabular-nums px-2.5 py-[5px] rounded-full"
								style={{
									background: 'rgba(255,255,255,0.08)',
									border: '1px solid rgba(255,255,255,0.12)',
									backdropFilter: 'blur(16px)',
									color: 'rgba(255,255,255,0.55)',
									letterSpacing: '0.2em',
								}}
							>
								{epCode}
							</span>
						</motion.div>

						{/* Title on image — visible on all sizes */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.22, type: 'spring', stiffness: 240, damping: 26 }}
							className="absolute bottom-0 left-0 right-0 px-5 pb-5"
						>
							<h3
								className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight tracking-tight"
								style={{
									fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
									textShadow: '0 2px 16px rgba(0,0,0,0.8)',
								}}
							>
								{episode.name || `Episode ${episode.episode_number}`}
							</h3>
						</motion.div>
					</div>
				) : (
					/* No still — minimal header */
					<div className="px-5 pt-5 pb-1">
						<p
							className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30 mb-1.5"
						>
							{epCode}
						</p>
						<h3
							className="text-lg font-bold text-white leading-snug tracking-tight"
							style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
						>
							{episode.name || `Episode ${episode.episode_number}`}
						</h3>
					</div>
				)}

				{/* ── Body ── */}
				<motion.div
					variants={stagger}
					initial="hidden"
					animate="visible"
					className="px-5 py-4 md:px-6 md:py-5 flex flex-col gap-5"
				>
					{/* Inline metadata strip */}
					{(hasRating || hasRuntime || airLabel) && (
						<motion.div
							variants={fadeUp}
							className="flex items-center gap-0 flex-wrap"
						>
							{hasRating && (
								<span
									className="inline-flex items-center gap-1 text-[12px] font-bold tabular-nums pr-3"
									style={{ color: '#FFD60A' }}
								>
									<StarIcon weight="fill" size={10} />
									{(episode.vote_average ?? 0).toFixed(1)}
								</span>
							)}
							{hasRating && (hasRuntime || airLabel) && (
								<span className="text-white/15 text-[10px] pr-3">|</span>
							)}
							{hasRuntime && (
								<span className="inline-flex items-center gap-1 text-[12px] text-white/45 tabular-nums pr-3">
									<ClockIcon size={10} className="text-white/25" />
									{episode.runtime} min
								</span>
							)}
							{hasRuntime && airLabel && (
								<span className="text-white/15 text-[10px] pr-3">|</span>
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
							<p
								className="text-[13.5px] sm:text-sm text-white/60 leading-relaxed"
								style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' }}
							>
								{episode.overview}
							</p>
						</motion.div>
					)}

					{/* Crew */}
					{(director?.name || writerNames) && (
						<motion.div
							variants={fadeUp}
							className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4"
							style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
						>
							{director?.name && (
								<div className="flex items-start gap-2.5">
									<FilmSlateIcon size={13} className="text-white/22 mt-[1px] flex-shrink-0" />
									<div>
										<p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-white/25 mb-0.5">
											Director
										</p>
										<p className="text-[12.5px] font-semibold text-white/75">{director.name}</p>
									</div>
								</div>
							)}
							{writerNames && (
								<div className="flex items-start gap-2.5">
									<PencilSimpleIcon size={13} className="text-white/22 mt-[1px] flex-shrink-0" />
									<div>
										<p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-white/25 mb-0.5">
											Written by
										</p>
										<p className="text-[12.5px] font-semibold text-white/75 leading-snug">{writerNames}</p>
									</div>
								</div>
							)}
						</motion.div>
					)}

					{/* Guest stars — horizontal portrait strip */}
					{guests.length > 0 && (
						<motion.div
							variants={fadeUp}
							className="pt-4"
							style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
						>
							<p className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-white/25 mb-3">
								Guest Stars
							</p>
							<div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
								{guests.map((g, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, scale: 0.92 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{
											delay: 0.28 + i * 0.04,
											type: 'spring',
											stiffness: 300,
											damping: 26,
										}}
										className="flex-shrink-0 flex flex-col items-center gap-1.5 w-14"
									>
										{g.profile_path ? (
											<div className="relative w-14 h-[84px] rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
												<Image
													src={tmdbImage(g.profile_path, 'w185')}
													alt={g.name || ''}
													fill
													loading="lazy"
													sizes="56px"
													className="object-cover"
												/>
												<div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-xl pointer-events-none" />
											</div>
										) : (
											<div className="w-14 h-[84px] rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
												<UserIcon size={18} className="text-white/25" />
											</div>
										)}
										<p className="text-[10px] font-medium text-white/55 text-center leading-tight line-clamp-2 w-full">
											{g.name}
										</p>
										{g.character && (
											<p className="text-[9px] text-white/25 text-center leading-tight line-clamp-1 w-full hidden sm:block">
												{g.character}
											</p>
										)}
									</motion.div>
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
