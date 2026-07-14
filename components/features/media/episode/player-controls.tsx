'use client';

import React from 'react';
import { GearIcon, CaretRightIcon, XIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProviderSummary } from './providers';

/* ── Shared glass surface styles (matches header exactly) ── */
const glassPill =
	'rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.35)]';

const glassOrb =
	'rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.35)]';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format raw seconds into H:MM:SS or M:SS */
function formatTimestamp(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	if (h > 0) {
		return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}
	return `${m}:${String(s).padStart(2, '0')}`;
}

// ── ResumeChip ────────────────────────────────────────────────────────────────

interface ResumeChipProps {
	seconds: number;
	onResume: () => void;
}

function ResumeChip({ seconds, onResume }: ResumeChipProps) {
	return (
		<button
			onClick={onResume}
			className={cn(
				glassPill,
				'inline-flex h-9 items-center gap-1.5 px-3',
				'text-[11px] font-medium text-white/70',
				'transition-[background-color,color,transform] duration-200',
				'hover:bg-white/[0.10] hover:text-white active:scale-[0.98]',
				'md:h-10 md:px-3.5 md:text-sm group/resume'
			)}
			title={`Resume from ${formatTimestamp(seconds)}`}
		>
			<ArrowCounterClockwiseIcon
				size={13}
				className="text-white/40 group-hover/resume:text-white/70 transition-colors duration-200"
			/>
			<span className="hidden sm:inline">Resume</span>
			<span className="font-mono tracking-tight text-white/60 group-hover/resume:text-white transition-colors duration-200">
				{formatTimestamp(seconds)}
			</span>
		</button>
	);
}

// ── PlayerControls ────────────────────────────────────────────────────────────

interface PlayerControlsProps {
	providers: ProviderSummary[];
	selectedProvider: string;
	onProviderChange: (id: string) => void;
	/** Seconds of saved progress. Shows a resume chip when > 30. */
	savedPositionSeconds: number;
	/** Called when the user clicks the resume chip. */
	onResume: () => void;
	/** True once the user has already resumed, so the chip is hidden. */
	hasResumed: boolean;
	/** Only rendered for TV shows */
	onNextEpisode?: (() => void) | undefined;
	mediaType: string;
	isSticky?: boolean;
	onCloseSticky?: (() => void) | undefined;
}

export function PlayerControls({
	providers,
	selectedProvider,
	onProviderChange,
	savedPositionSeconds,
	onResume,
	hasResumed,
	onNextEpisode,
	mediaType,
	isSticky,
	onCloseSticky,
}: PlayerControlsProps) {
	const showResumeChip = !hasResumed && savedPositionSeconds > 30;

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			{/* Left side: provider selector + resume chip */}
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<div className="flex min-w-0 items-center gap-2">
					<span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:inline">
						Source
					</span>
					<Select value={selectedProvider} onValueChange={onProviderChange}>
						<SelectTrigger
							className={cn(
								glassPill,
								'h-9 w-fit min-w-0 max-w-[52vw]',
								'flex items-center gap-2 px-3',
								'border-0 focus:ring-0 focus:ring-offset-0',
								'text-xs text-white/80',
								'transition-[background-color,color,transform] duration-200',
								'hover:bg-white/[0.10] active:scale-[0.98]',
								'md:h-10 md:max-w-none md:px-4'
							)}
						>
							<GearIcon size={16} className="shrink-0 text-white/40" />
							<SelectValue className="truncate text-xs font-medium text-white/80 md:text-sm" />
						</SelectTrigger>
						<SelectContent className="max-h-[300px] rounded-xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
							{providers.map((provider) => (
								<SelectItem
									key={provider.id}
									value={provider.id}
									className="text-xs rounded-lg focus:bg-white/[0.08] focus:text-white hover:bg-white/[0.06] hover:text-white/90"
								>
									{provider.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{showResumeChip && (
					<ResumeChip seconds={savedPositionSeconds} onResume={onResume} />
				)}
			</div>

			{/* Right side: next episode + close sticky — TV only */}
			{onNextEpisode && mediaType === 'tv' && (
				<div className="flex shrink-0 items-center gap-2">
					{/* Mobile: circle orb | Desktop: full pill with text */}
					<button
						onClick={onNextEpisode}
						className={cn(
							/* Mobile: circle orb */
							'h-9 w-9 flex items-center justify-center',
							/* Desktop: pill with text */
							'md:h-10 md:w-auto md:px-4 md:gap-1.5',
							'text-white/80',
							'transition-[background-color,transform] duration-200',
							'hover:bg-white/[0.10] hover:text-white active:scale-[0.98]',
							'group/next',
							/* Glass */
							glassOrb,
							'md:' + glassPill
						)}
						aria-label="Next episode"
						title="Next episode"
					>
						<span className="hidden md:inline text-xs font-semibold">Next</span>
						<CaretRightIcon
							size={18}
							className="transition-transform group-hover/next:translate-x-0.5"
						/>
					</button>

					{isSticky && onCloseSticky && (
						<button
							onClick={onCloseSticky}
							className={cn(
								glassOrb,
								'h-9 w-9 flex items-center justify-center',
								'text-white/70',
								'transition-[background-color,color,transform] duration-200',
								'hover:bg-white/[0.10] hover:text-white active:scale-[0.98]',
								'md:h-10 md:w-10'
							)}
							aria-label="Hide sticky player"
							title="Hide sticky player"
						>
							<XIcon size={16} />
						</button>
					)}
				</div>
			)}
		</div>
	);
}
