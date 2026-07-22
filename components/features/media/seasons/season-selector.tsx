'use client';

import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CaretDownIcon, CheckIcon, XIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface Season {
	season_number: number;
	name?: string;
	episode_count?: number;
}

interface SeasonSelectorProps {
	seasons: Season[];
	activeSeason: number;
	onSeasonChange: (seasonNumber: number) => void;
}

function seasonLabel(season: Season) {
	return season.name && !/^Season \d+$/i.test(season.name)
		? season.name
		: `Season ${season.season_number}`;
}

function SeasonSelectorComponent({ seasons, activeSeason, onSeasonChange }: SeasonSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const reducedMotion = useReducedMotion();
	const active = seasons.find((season) => season.season_number === activeSeason) ?? seasons[0];
	const useSheet = seasons.length >= 5;

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setIsOpen(false);
		};
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', closeOnEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', closeOnEscape);
		};
	}, [isOpen]);

	if (!active) return null;

	if (!useSheet) {
		return (
			<div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
				<div
					role="tablist"
					aria-label="Seasons"
					className="flex min-w-max gap-1 rounded-2xl bg-white/[0.045] p-1 ring-1 ring-inset ring-white/[0.07]"
				>
					{seasons.map((season) => {
						const isActive = season.season_number === activeSeason;
						return (
							<button
								key={season.season_number}
								type="button"
								role="tab"
								aria-selected={isActive}
								onClick={() => onSeasonChange(season.season_number)}
								className={cn(
									'relative flex h-11 min-w-[6.5rem] items-center justify-center rounded-xl px-4 text-[13px] font-semibold tracking-[-0.01em] outline-none transition-colors active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/70',
									isActive ? 'text-zinc-950' : 'text-white/55 hover:text-white'
								)}
							>
								{isActive && (
									<motion.span
										layoutId="season-selection"
										className="absolute inset-0 rounded-xl bg-white shadow-[0_5px_18px_rgba(0,0,0,0.28)]"
										transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
									/>
								)}
								<span className="relative z-10">Season {season.season_number}</span>
							</button>
						);
					})}
				</div>
			</div>
		);
	}

	const sheet = (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[80]" role="presentation">
					<motion.button
						type="button"
						aria-label="Close season selector"
						className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[2px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsOpen(false)}
					/>
					<motion.div
						role="dialog"
						aria-modal="true"
						aria-labelledby="season-sheet-title"
						data-season-sheet
						initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: '100%' }}
						animate={{ opacity: 1, y: 0 }}
						exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: '100%' }}
						transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
						className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-hidden rounded-t-[28px] border-t border-white/12 bg-zinc-950/88 shadow-[0_-24px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl md:inset-x-auto md:bottom-8 md:left-1/2 md:ml-[-15rem] md:w-[30rem] md:rounded-[28px] md:border"
					>
						<div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-white/20" />
						<div className="flex items-center justify-between px-5 pb-3 pt-4">
							<div>
								<h3
									id="season-sheet-title"
									className="text-xl font-bold tracking-[-0.025em] text-white"
								>
									Choose a Season
								</h3>
								<p className="mt-0.5 text-sm text-white/45">
									{seasons.length} seasons available
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								aria-label="Close"
								className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white active:scale-[0.94]"
							>
								<XIcon size={18} weight="bold" />
							</button>
						</div>
						<div className="overflow-y-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
							{seasons.map((season) => {
								const isActive = season.season_number === activeSeason;
								return (
									<button
										key={season.season_number}
										type="button"
										aria-current={isActive ? 'true' : undefined}
										onClick={() => {
											onSeasonChange(season.season_number);
											setIsOpen(false);
										}}
										className={cn(
											'flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-left outline-none active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/70',
											isActive
												? 'bg-white text-zinc-950'
												: 'text-white hover:bg-white/[0.06]'
										)}
									>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">
												{seasonLabel(season)}
											</span>
											{season.episode_count != null && (
												<span
													className={cn(
														'block text-xs',
														isActive ? 'text-black/50' : 'text-white/35'
													)}
												>
													{season.episode_count} episodes
												</span>
											)}
										</span>
										{isActive && <CheckIcon size={19} weight="bold" />}
									</button>
								);
							})}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				className="flex min-h-12 w-full items-center gap-3 rounded-2xl bg-white/[0.055] px-4 text-left ring-1 ring-inset ring-white/[0.08] active:scale-[0.985] md:w-auto"
			>
				<span className="min-w-0 flex-1">
					<span className="block truncate text-sm font-semibold tracking-[-0.01em] text-white">
						{seasonLabel(active)}
					</span>
					{active.episode_count != null && (
						<span className="block text-[11px] text-white/40">
							{active.episode_count} episodes
						</span>
					)}
				</span>
				<CaretDownIcon size={16} weight="bold" className="text-white/55" />
			</button>
			{typeof document !== 'undefined' ? createPortal(sheet, document.body) : null}
		</>
	);
}

export const SeasonSelector = memo(SeasonSelectorComponent);
SeasonSelectorComponent.displayName = 'SeasonSelector';
